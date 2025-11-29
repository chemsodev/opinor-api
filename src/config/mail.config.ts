import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM || 'noreply@opinor.com',
  adminNotificationEmail:
    process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@opinor.com',
}));
