import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  // EmailJS Configuration
  emailjsServiceId: process.env.EMAILJS_SERVICE_ID,
  emailjsTemplateId: process.env.EMAILJS_TEMPLATE_ID,
  emailjsJoinRequestTemplateId: process.env.EMAILJS_JOIN_REQUEST_TEMPLATE_ID,
  emailjsPublicKey: process.env.EMAILJS_PUBLIC_KEY,
  emailjsPrivateKey: process.env.EMAILJS_PRIVATE_KEY,
  adminNotificationEmail:
    process.env.ADMIN_NOTIFICATION_EMAIL || 'hello.opinor@workmail.com',
}));
