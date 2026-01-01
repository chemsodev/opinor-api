import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../../database/entities/enums';
import {
  SendNotificationDto,
  SendBulkNotificationDto,
  SendToAllNotificationDto,
} from './dto';

@ApiTags('Admin - Users Management')
@ApiBearerAuth('access-token')
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all business owners',
    description: 'Returns paginated list of all registered business owners',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'List of users',
    schema: {
      example: {
        success: true,
        data: {
          users: [
            {
              id: 'uuid',
              email: 'owner@business.com',
              businessName: 'My Restaurant',
              isActive: true,
              isBlocked: false,
            },
          ],
          pagination: { page: 1, limit: 20, total: 50, totalPages: 3 },
        },
      },
    },
  })
  async getAllUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.usersService.findAll(+page, +limit);
  }

  @Patch(':id/block')
  @ApiOperation({
    summary: 'Block a user',
    description:
      'Block a business owner account (e.g., for payment issues). User will not be able to login.',
  })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiOkResponse({
    description: 'User blocked successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'owner@business.com',
          isBlocked: true,
          blockedReason: 'Payment overdue',
          blockedAt: '2026-01-01T12:00:00.000Z',
        },
        message: 'User has been blocked',
      },
    },
  })
  async blockUser(
    @Param('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    const user = await this.usersService.blockUser(
      userId,
      reason || 'Payment required. Please contact support.',
    );

    // Create notification for the user
    await this.notificationsService.createNotification(userId, {
      type: NotificationType.ACCOUNT_BLOCKED,
      title: 'Account Blocked',
      message:
        reason ||
        'Your account has been blocked. Please contact support or complete your payment.',
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        isBlocked: user.isBlocked,
        blockedReason: user.blockedReason,
        blockedAt: user.blockedAt?.toISOString(),
      },
      message: 'User has been blocked',
    };
  }

  @Patch(':id/unblock')
  @ApiOperation({
    summary: 'Unblock a user',
    description:
      'Unblock a business owner account (e.g., after payment is received). User will be able to login again.',
  })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiOkResponse({
    description: 'User unblocked successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'owner@business.com',
          isBlocked: false,
        },
        message: 'User has been unblocked',
      },
    },
  })
  async unblockUser(@Param('id') userId: string) {
    const user = await this.usersService.unblockUser(userId);

    // Create notification for the user
    await this.notificationsService.createNotification(userId, {
      type: NotificationType.ACCOUNT_UNBLOCKED,
      title: 'Account Unblocked',
      message:
        'Your account has been unblocked. You can now login and use all features.',
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        isBlocked: user.isBlocked,
      },
      message: 'User has been unblocked',
    };
  }

  // ==========================================
  // Manual Notification Endpoints
  // ==========================================

  @Post(':id/notify')
  @ApiOperation({
    summary: 'Send notification to a user',
    description:
      'Send a custom notification to a specific business owner. Optionally link to a feedback.',
  })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiOkResponse({
    description: 'Notification sent successfully',
    schema: {
      example: {
        success: true,
        data: {
          notificationId: 'uuid',
          userId: 'uuid',
          title: 'Important Update',
          sentAt: '2026-01-01T12:00:00.000Z',
        },
        message: 'Notification sent successfully',
      },
    },
  })
  async sendNotificationToUser(
    @Param('id') userId: string,
    @Body() dto: SendNotificationDto,
  ) {
    // Verify user exists
    await this.usersService.findById(userId);

    const notification = await this.notificationsService.createNotification(
      userId,
      {
        type: dto.type || NotificationType.SYSTEM,
        title: dto.title,
        message: dto.message,
        relatedId: dto.feedbackId,
      },
    );

    return {
      success: true,
      data: {
        notificationId: notification.id,
        userId: userId,
        title: dto.title,
        sentAt: notification.createdAt.toISOString(),
      },
      message: 'Notification sent successfully',
    };
  }

  @Post('notify/bulk')
  @ApiOperation({
    summary: 'Send notification to multiple users',
    description:
      'Send the same notification to multiple business owners at once.',
  })
  @ApiOkResponse({
    description: 'Notifications sent successfully',
    schema: {
      example: {
        success: true,
        data: {
          sentCount: 5,
          userIds: ['uuid-1', 'uuid-2'],
        },
        message: 'Notifications sent to 5 users',
      },
    },
  })
  async sendBulkNotification(@Body() dto: SendBulkNotificationDto) {
    const notifications =
      await this.notificationsService.createBulkNotifications(
        dto.userIds.map((userId) => ({
          userId,
          type: dto.type || NotificationType.SYSTEM,
          title: dto.title,
          message: dto.message,
        })),
      );

    return {
      success: true,
      data: {
        sentCount: notifications.length,
        userIds: dto.userIds,
      },
      message: `Notifications sent to ${notifications.length} users`,
    };
  }

  @Post('notify/all')
  @ApiOperation({
    summary: 'Send notification to all users',
    description:
      'Send a notification to all active business owners (e.g., system announcements).',
  })
  @ApiOkResponse({
    description: 'Notifications sent to all users',
    schema: {
      example: {
        success: true,
        data: {
          sentCount: 150,
        },
        message: 'Notifications sent to 150 users',
      },
    },
  })
  async sendNotificationToAll(@Body() dto: SendToAllNotificationDto) {
    const count = await this.notificationsService.sendToAllUsers({
      type: dto.type || NotificationType.SYSTEM,
      title: dto.title,
      message: dto.message,
    });

    return {
      success: true,
      data: {
        sentCount: count,
      },
      message: `Notifications sent to ${count} users`,
    };
  }
}
