import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminFeedbacksService } from './admin-feedbacks.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminFeedbacksController } from './admin-feedbacks.controller';
import { AdminQrcodeController } from './admin-qrcode.controller';
import { Admin, Feedback, User } from '../../database/entities';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { QrcodeModule } from '../qrcode/qrcode.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Feedback, User]),
    forwardRef(() => UsersModule),
    forwardRef(() => NotificationsModule),
    QrcodeModule,
  ],
  controllers: [
    AdminUsersController,
    AdminFeedbacksController,
    AdminQrcodeController,
  ],
  providers: [AdminService, AdminFeedbacksService],
  exports: [AdminService, AdminFeedbacksService],
})
export class AdminModule {}
