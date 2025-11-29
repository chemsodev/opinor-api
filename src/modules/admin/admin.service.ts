import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin, AdminRole } from '../../database/entities';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
  ) {}

  async findById(id: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { email } });
  }

  async create(
    email: string,
    password: string,
    role: AdminRole = AdminRole.ADMIN,
  ): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = this.adminRepository.create({
      email,
      password: hashedPassword,
      role,
    });
    return this.adminRepository.save(admin);
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    const hashedRefreshToken = refreshToken
      ? await bcrypt.hash(refreshToken, 10)
      : null;
    await this.adminRepository.update(id, { refreshToken: hashedRefreshToken });
  }

  async validateRefreshToken(
    id: string,
    refreshToken: string,
  ): Promise<boolean> {
    const admin = await this.findById(id);
    if (!admin.refreshToken) {
      return false;
    }
    return bcrypt.compare(refreshToken, admin.refreshToken);
  }

  async findAll(): Promise<Admin[]> {
    return this.adminRepository.find({
      select: ['id', 'email', 'role', 'createdAt'],
    });
  }
}
