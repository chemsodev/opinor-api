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

### 🔐 Authentication
Most endpoints require a Bearer token. Login with your credentials to get an access token.

**Business Owner Login:** \`POST /auth/login\`
**Admin Login:** \`POST /auth/admin/login\`

### 👤 User Roles
- **Business Owner**: Manages their business, views feedbacks, responds to customers
- **Admin**: Manages all business owners, handles payments, sends notifications

### ✨ Key Features

#### For Business Owners:
- 📝 **Anonymous Feedback**: Customers submit feedback via QR code
- 📊 **Dashboard**: Real-time statistics and achievement tracking
- 📈 **Reports**: Detailed analytics and exportable reports (PDF/CSV)
- 🔔 **Notifications**: Auto-alerts for new feedbacks, performance changes
- 📱 **QR Code**: Generate and track QR code scans
- 🔒 **Password Management**: Change password securely

#### For Admins:
- 👥 **User Management**: View all business owners
- 🚫 **Block/Unblock**: Manage account access (payment control)
- 📢 **Manual Notifications**: Send custom notifications to users
- 📣 **Broadcast**: Send announcements to all users

### 🔔 Notification Types
| Type | Description |
|------|-------------|
| 🔴 Critical | Negative feedback (1-2★), critical keywords detected |
| 🟢 Positive | Good reviews (4-5★), compliments |
| 🟡 Admin | Subscription, payment, account status |
| 🟠 Performance | Drops, improvements, trends |
| 🔵 Reports | Weekly summaries, insights |
| ⚪ System | QR scans, app updates |

### 🚨 Critical Keywords Detection
The system automatically scans feedback comments for **70+ critical keywords** in French. When detected, business owners receive an immediate alert.

**Keyword Categories:**
| Category | Examples |
|----------|----------|
| 🏥 Hygiene & Health | intoxication, malade, vomi, allergie, bactérie, cheveux, cafard |
| 🧹 Cleanliness | sale, dégueulasse, dégoûtant, puant, crasseux |
| 💰 Fraud & Theft | arnaque, vol, escroquerie, fraude, malhonnête |
| ⚠️ Violence & Behavior | agression, insulte, menace, harcèlement, racisme |
| 😤 Extreme Dissatisfaction | scandaleux, inadmissible, catastrophe, cauchemar |
| ⚖️ Legal Threats | avocat, plainte, tribunal, procès, poursuite |
| 🚑 Safety | blessure, accident, urgence, hôpital |
| 🍽️ Quality Issues | immangeable, avarié, contaminé, toxique |
| 👎 Strong Negatives | nul, minable, lamentable, incompétent |
| 💸 Refund | remboursement, réclamation, litige |

When critical keywords are detected, a **"🔴 Mots-clés critiques détectés"** notification is sent with up to 3 detected keywords.

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
    .addTag('Auth', 'Authentication, registration & password management')
    .addTag('Users', 'User profile, business info & settings')
    .addTag('Dashboard', 'Home screen data, stats & achievements')
    .addTag('Feedbacks', 'Anonymous feedback submission & management')
    .addTag('Reports', 'Analytics, statistics & export')
    .addTag('Notifications', 'Push notifications & alerts')
    .addTag('QR Code', 'QR code generation & scan tracking')
    .addTag('Join Requests', 'Business registration requests')
    .addTag(
      'Admin - Users Management',
      '👑 Admin: Manage business owners, block/unblock, send notifications',
    )
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
