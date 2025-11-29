import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  reviewPageUrl: process.env.REVIEW_PAGE_URL || 'http://localhost:3001/review',
  throttleTtl: parseInt(process.env.THROTTLE_TTL ?? '60000', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
}));
