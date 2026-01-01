import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '../users/users.service';
import { AdminService } from '../admin/admin.service';
import { JoinRequestsService } from '../join-requests/join-requests.service';
import { MailService } from '../mail/mail.service';
import {
  LoginDto,
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { JoinRequestStatus } from '../../database/entities';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
    private readonly joinRequestsService: JoinRequestsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Check if user is blocked (payment issue)
    if (user.isBlocked) {
      throw new UnauthorizedException(
        user.blockedReason ||
          'Your account has been blocked. Please contact support or complete your payment.',
      );
    }

    const tokens = await this.generateTokens(user.id, user.email, 'user');
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          role: 'business_owner',
          avatar: user.avatar,
          createdAt: user.createdAt.toISOString(),
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Login successful',
    };
  }

  async adminLogin(loginDto: LoginDto) {
    const admin = await this.adminService.findByEmail(loginDto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      admin.id,
      admin.email,
      'admin',
      admin.role,
    );
    await this.adminService.updateRefreshToken(admin.id, tokens.refreshToken);

    return {
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          role: admin.role,
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Admin login successful',
    };
  }

  async register(registerDto: RegisterDto) {
    // Verify the code exists and is approved
    const joinRequest = await this.joinRequestsService.findByCode(
      registerDto.code,
    );

    if (!joinRequest) {
      throw new BadRequestException('Invalid invitation code');
    }

    if (joinRequest.status !== JoinRequestStatus.APPROVED) {
      throw new BadRequestException('Invitation code is not approved');
    }

    if (joinRequest.isUsed) {
      throw new BadRequestException('Invitation code has already been used');
    }

    // Check if email matches the join request
    if (joinRequest.email !== registerDto.email) {
      throw new BadRequestException('Email does not match the invitation');
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Create the user
    const user = await this.usersService.create({
      email: registerDto.email,
      password: registerDto.password,
      businessName: registerDto.businessName,
      businessType: registerDto.businessType,
      phone: registerDto.phone,
      address: registerDto.address,
    });

    // Mark the code as used
    await this.joinRequestsService.markCodeAsUsed(registerDto.code);

    // Send welcome email (non-blocking)
    this.mailService
      .sendWelcomeEmail(user.email, user.businessName, user.uniqueCode)
      .catch((err) =>
        console.warn(
          `[Auth] Welcome email failed for ${user.email}:`,
          err.message,
        ),
      );

    const tokens = await this.generateTokens(user.id, user.email, 'user');
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          businessName: user.businessName,
          role: 'business_owner',
          createdAt: user.createdAt.toISOString(),
        },
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Account created successfully',
    };
  }

  async refreshToken(
    userId: string,
    refreshToken: string,
    type: 'user' | 'admin',
  ) {
    if (type === 'user') {
      const isValid = await this.usersService.validateRefreshToken(
        userId,
        refreshToken,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.usersService.findById(userId);
      const tokens = await this.generateTokens(user.id, user.email, 'user');
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } else {
      const isValid = await this.adminService.validateRefreshToken(
        userId,
        refreshToken,
      );
      if (!isValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const admin = await this.adminService.findById(userId);
      const tokens = await this.generateTokens(
        admin.id,
        admin.email,
        'admin',
        admin.role,
      );
      await this.adminService.updateRefreshToken(admin.id, tokens.refreshToken);

      return tokens;
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      throw new BadRequestException('No account found with this email address');
    }

    const resetToken = uuidv4();
    await this.usersService.setPasswordResetToken(user.email, resetToken);

    // Send email in background (non-blocking)
    this.mailService
      .sendPasswordResetEmail(user.email, resetToken)
      .catch((err) =>
        console.warn(
          `[Auth] Password reset email failed for ${user.email}:`,
          err.message,
        ),
      );

    // DEV ONLY: Log token for testing (remove in production!)
    console.log(`[DEV] Password reset token for ${user.email}: ${resetToken}`);

    return {
      message: 'Password reset link has been sent to your email',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    await this.usersService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );

    return { message: 'Password has been reset successfully' };
  }

  async getMe(userId: string, type: 'user' | 'admin') {
    if (type === 'user') {
      const user = await this.usersService.findById(userId);
      const {
        password,
        refreshToken,
        passwordResetToken,
        passwordResetExpires,
        ...result
      } = user;
      return result;
    } else {
      const admin = await this.adminService.findById(userId);
      const { password, refreshToken, ...result } = admin;
      return result;
    }
  }

  async logout(userId: string, type: 'user' | 'admin') {
    if (type === 'user') {
      await this.usersService.updateRefreshToken(userId, null);
    } else {
      await this.adminService.updateRefreshToken(userId, null);
    }
    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Get user
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(userId, hashedPassword);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  private async generateTokens(
    userId: string,
    email: string,
    type: 'user' | 'admin',
    role?: string,
  ) {
    const payload = { sub: userId, email, type, ...(role && { role }) };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.accessExpiration'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiration'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
