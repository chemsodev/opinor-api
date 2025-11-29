# Opinor API

A NestJS backend API for **Opinor** - a feedback/review system for businesses (restaurants, private beaches, clinics).

## Overview

- Businesses (clients) use a mobile app to view customer feedback and analytics
- End customers scan QR codes to leave reviews on a website
- Each business has a unique QR code linked to their review page

## Tech Stack

- **NestJS** with TypeScript
- **PostgreSQL** with TypeORM
- **JWT** Authentication
- **Nodemailer** for emails
- **Class-validator** for validation
- **Swagger/OpenAPI** for API documentation

## Project Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

### Database Setup

```bash
# Run migrations (if you have any)
npm run migration:run

# Seed the database with default admin
npm run seed
```

### Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

- http://localhost:3000/api/docs

## API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /login` - Login for business owners
- `POST /admin/login` - Admin login
- `POST /register` - Complete registration with invitation code
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token
- `GET /me` - Get current user profile
- `POST /logout` - Logout user

### Join Requests (`/api/v1/join-requests`)

- `POST /` - Submit join request (public)
- `GET /verify/:code` - Verify invitation code (public)
- `GET /` - Get all join requests (admin)
- `GET /:id` - Get specific join request (admin)
- `PUT /:id/review` - Approve/reject join request (admin)

### Feedbacks (`/api/v1/feedbacks`)

- `POST /:businessCode` - Submit feedback (public)
- `GET /business/:businessCode/stats` - Get public stats
- `GET /` - Get own business feedbacks (authenticated)
- `GET /stats` - Get own business statistics (authenticated)
- `GET /:id` - Get specific feedback (authenticated)
- `DELETE /:id` - Hide feedback (authenticated)

### Users (`/api/v1/users`)

- `GET /profile` - Get current user profile
- `PUT /profile` - Update profile

## Project Structure

```
src/
├── common/
│   ├── decorators/     # Custom decorators
│   ├── filters/        # Exception filters
│   ├── guards/         # Auth guards
│   └── interceptors/   # Response interceptors
├── config/             # Configuration files
├── database/
│   ├── entities/       # TypeORM entities
│   ├── migrations/     # Database migrations
│   └── seeds/          # Database seeders
├── modules/
│   ├── admin/          # Admin module
│   ├── auth/           # Authentication module
│   ├── feedbacks/      # Feedbacks module
│   ├── join-requests/  # Join requests module
│   ├── mail/           # Email module
│   └── users/          # Users module
├── app.module.ts
└── main.ts
```

## Default Admin Credentials

After running the seed command:

- **Email**: admin@opinor.com
- **Password**: Admin@123

⚠️ **Please change these credentials immediately after first login!**

## License

UNLICENSED

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
