import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
