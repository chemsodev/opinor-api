import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminService } from '../../admin/admin.service';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'admin';
}

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private configService: ConfigService,
    private adminService: AdminService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: AdminJwtPayload) {
    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Invalid token type');
    }

    const admin = await this.adminService.findById(payload.sub);
    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };
  }
}
