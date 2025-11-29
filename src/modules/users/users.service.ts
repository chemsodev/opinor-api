import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities';
import { CreateUserDto, UpdateUserDto } from './dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findByUniqueCode(uniqueCode: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { uniqueCode } });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const uniqueCode = this.generateUniqueCode();

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      uniqueCode,
      qrCodeUrl: this.generateQrCodeUrl(uniqueCode),
      isActive: true,
      isEmailVerified: true,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.userRepository.update(id, { refreshToken: hashedRefreshToken });
  }

  async validateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.findById(id);
    if (!user.refreshToken) {
      return false;
    }
    return bcrypt.compare(refreshToken, user.refreshToken);
  }

  async setPasswordResetToken(email: string, token: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedToken = await bcrypt.hash(token, 10);
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.userRepository.update(user.id, {
      passwordResetToken: hashedToken,
      passwordResetExpires: expires,
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Check all users with a password reset token
    const allUsers = await this.userRepository.find({
      where: { passwordResetToken: Not(IsNull()) },
    });

    // Find user with valid token
    let validUser: User | null = null;
    for (const user of allUsers) {
      if (
        user.passwordResetToken &&
        user.passwordResetExpires &&
        user.passwordResetExpires > new Date()
      ) {
        const isValid = await bcrypt.compare(token, user.passwordResetToken);
        if (isValid) {
          validUser = user;
          break;
        }
      }
    }

    if (!validUser) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(validUser.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    });
  }

  private generateUniqueCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }

  private generateQrCodeUrl(uniqueCode: string): string {
    return `${process.env.REVIEW_PAGE_URL || 'http://localhost:3001/review'}/${uniqueCode}`;
  }
}
