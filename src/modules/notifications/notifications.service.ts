import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../database/entities';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(userId: string, page = 1, limit = 20) {
    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          relatedId: n.relatedId,
          icon: this.getIconForType(n.type),
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);

    return {
      success: true,
      data: {
        id: notification.id,
        isRead: true,
        readAt: notification.readAt.toISOString(),
      },
      message: 'Notification marked as read',
    };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedId?: string,
  ) {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      relatedId,
      icon: this.getIconForType(type),
    });

    return this.notificationRepository.save(notification);
  }

  async getUnreadCount(userId: string) {
    const count = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return {
      success: true,
      data: { unreadCount: count },
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);

    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  private getIconForType(type: NotificationType): string {
    const iconMap = {
      [NotificationType.NEW_FEEDBACK]: 'chatbubble-outline',
      [NotificationType.REPORT_READY]: 'document-outline',
      [NotificationType.ACHIEVEMENT_UNLOCKED]: 'star',
      [NotificationType.RATING_ALERT]: 'alert-circle',
      [NotificationType.SYSTEM]: 'notifications-outline',
    };
    return iconMap[type] || 'notifications-outline';
  }
}
