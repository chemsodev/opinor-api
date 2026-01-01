import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, AdminJwtStrategy } from './strategies';
import { UsersModule } from '../users/users.module';
import { AdminModule } from '../admin/admin.module';
import { JoinRequestsModule } from '../join-requests/join-requests.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.accessExpiration'),
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    forwardRef(() => AdminModule),
    forwardRef(() => JoinRequestsModule),
    MailModule,
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AdminJwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
