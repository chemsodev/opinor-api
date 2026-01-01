import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
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
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../database/entities';

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all notifications',
    description: 'Returns paginated list of user notifications',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 20)',
  })
  @ApiOkResponse({
    description: 'List of notifications',
    schema: {
      example: {
        success: true,
        data: {
          notifications: [
            {
              id: 'uuid',
              type: 'new_feedback',
              title: 'New Feedback Received',
              body: 'You received a 5-star feedback',
              isRead: false,
              data: { feedbackId: 'uuid' },
              createdAt: '2026-01-01T12:00:00.000Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 45,
            totalPages: 3,
          },
        },
      },
    },
  })
  async getNotifications(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.notificationsService.getNotifications(user.id, +page, +limit);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Get unread count',
    description: 'Returns the number of unread notifications',
  })
  @ApiOkResponse({
    description: 'Unread notification count',
    schema: {
      example: {
        success: true,
        data: { unreadCount: 5 },
      },
    },
  })
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({
    summary: 'Mark as read',
    description: 'Mark a specific notification as read',
  })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiOkResponse({
    description: 'Notification marked as read',
    schema: {
      example: {
        success: true,
        message: 'Notification marked as read',
      },
    },
  })
  async markAsRead(
    @CurrentUser() user: User,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(user.id, notificationId);
  }

  @Patch('read-all')
  @ApiOperation({
    summary: 'Mark all as read',
    description: 'Mark all notifications as read',
  })
  @ApiOkResponse({
    description: 'All notifications marked as read',
    schema: {
      example: {
        success: true,
        message: 'All notifications marked as read',
      },
    },
  })
  async markAllAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification',
  })
  @ApiParam({ name: 'id', description: 'Notification ID (UUID)' })
  @ApiOkResponse({
    description: 'Notification deleted',
    schema: {
      example: {
        success: true,
        message: 'Notification deleted',
      },
    },
  })
  async deleteNotification(
    @CurrentUser() user: User,
    @Param('id') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(
      user.id,
      notificationId,
    );
  }
}
