import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Opinor API')
    .setDescription(
      `
## Opinor - Anonymous Feedback System for Businesses

Opinor helps business owners collect and manage anonymous customer feedback through QR codes.

### Authentication
Most endpoints require a Bearer token. Login with your business owner credentials to get an access token.

### Key Features
- **Anonymous Feedback**: Customers submit feedback via QR code without revealing identity
- **Dashboard**: Real-time statistics and achievement tracking
- **Reports**: Detailed analytics and exportable reports
- **Notifications**: Stay updated on new feedbacks and achievements
- **QR Code Management**: Generate and track QR code scans

### API Versioning
All endpoints are prefixed with \`/api/v1\`
      `,
    )
    .setVersion('2.0')
    .setContact('Opinor Support', 'https://opinor.app', 'support@opinor.app')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your access token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication & registration endpoints')
    .addTag('Users', 'User profile & settings management')
    .addTag('Dashboard', 'Home screen data & statistics')
    .addTag('Feedbacks', 'Feedback submission & management')
    .addTag('Reports', 'Analytics & reporting')
    .addTag('Notifications', 'Push notification management')
    .addTag('QR Code', 'QR code generation & tracking')
    .addTag('Join Requests', 'Business registration requests')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Opinor API Documentation',
    customfavIcon: 'https://opinor.app/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .swagger-ui .info .title { color: #3b82f6 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 3000;
  // Bind to 0.0.0.0 for cloud deployment (Render, Railway, etc.)
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port ${port}`);
  logger.log(`Swagger documentation: /api/docs`);
}
bootstrap();
