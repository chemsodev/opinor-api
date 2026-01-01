import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, User } from '../../database/entities';
import { NotificationType } from '../../database/entities/enums';

interface CreateNotificationDto {
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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

  async createNotification(userId: string, dto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      relatedId: dto.relatedId,
      icon: this.getIconForType(dto.type),
    });

    return this.notificationRepository.save(notification);
  }

  // Create multiple notifications at once
  async createBulkNotifications(
    notifications: Array<{ userId: string } & CreateNotificationDto>,
  ) {
    const entities = notifications.map((n) =>
      this.notificationRepository.create({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        relatedId: n.relatedId,
        icon: this.getIconForType(n.type),
      }),
    );

    return this.notificationRepository.save(entities);
  }

  // Helper methods for specific notification types
  async notifyCriticalFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.CRITICAL_NEGATIVE_FEEDBACK,
      title: '🔴 Alerte critique',
      message: `Vous avez reçu un avis ${rating}★. Une action rapide peut améliorer la situation.`,
      relatedId: feedbackId,
    });
  }

  async notifyPositiveFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.POSITIVE_FEEDBACK,
      title: '🟢 Nouvel avis positif',
      message: `Félicitations ! Vous avez reçu un avis ${rating}★.`,
      relatedId: feedbackId,
    });
  }

  async notifyNewFeedback(
    userId: string,
    feedbackId: string,
    rating: number,
    sentiment: string,
  ) {
    // Route to appropriate notification type based on rating
    if (rating <= 2) {
      return this.notifyCriticalFeedback(userId, feedbackId, rating);
    } else if (rating >= 4) {
      return this.notifyPositiveFeedback(userId, feedbackId, rating);
    } else {
      // Neutral feedback (3 stars)
      return this.createNotification(userId, {
        type: NotificationType.NEW_FEEDBACK,
        title: 'Nouveau feedback',
        message: `Vous avez reçu un avis ${rating}★.`,
        relatedId: feedbackId,
      });
    }
  }

  async notifySubscriptionExpiring(userId: string, daysLeft: number) {
    return this.createNotification(userId, {
      type: NotificationType.SUBSCRIPTION_EXPIRING,
      title: '🟡 Abonnement',
      message: `Votre abonnement Opinor expire dans ${daysLeft} jours.`,
    });
  }

  async notifyPaymentConfirmed(userId: string, planName: string) {
    return this.createNotification(userId, {
      type: NotificationType.PAYMENT_CONFIRMED,
      title: '🟡 Paiement confirmé',
      message: `Paiement confirmé – ${planName} activé.`,
    });
  }

  async notifyPerformanceDrop(
    userId: string,
    percentage: number,
    period: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.PERFORMANCE_DROP,
      title: '🟠 Performance en baisse',
      message: `Performance en baisse de ${percentage}% par rapport à ${period}.`,
    });
  }

  async notifyPerformanceImprovement(
    userId: string,
    percentage: number,
    reason?: string,
  ) {
    return this.createNotification(userId, {
      type: NotificationType.PERFORMANCE_IMPROVEMENT,
      title: '🟠 Amélioration détectée',
      message: `Amélioration de +${percentage}%${reason ? ` après ${reason}` : ''}.`,
    });
  }

  async notifyQrFirstScan(userId: string) {
    return this.createNotification(userId, {
      type: NotificationType.QR_FIRST_SCAN,
      title: '⚪ Premier scan',
      message: 'Votre QR code Opinor a été scanné pour la première fois !',
    });
  }

  async notifyQrScanMilestone(userId: string, scanCount: number) {
    return this.createNotification(userId, {
      type: NotificationType.QR_SCAN_MILESTONE,
      title: '⚪ QR Code populaire',
      message: `Votre QR Opinor a été scanné ${scanCount} fois aujourd'hui !`,
    });
  }

  // Send notification to all active users
  async sendToAllUsers(
    dto: Omit<CreateNotificationDto, 'relatedId'>,
  ): Promise<number> {
    // Get all active, non-blocked users
    const users = await this.userRepository.find({
      where: { isActive: true, isBlocked: false },
      select: ['id'],
    });

    if (users.length === 0) {
      return 0;
    }

    // Create notifications for all users
    const notifications = users.map((user) =>
      this.notificationRepository.create({
        userId: user.id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        icon: this.getIconForType(dto.type),
      }),
    );

    await this.notificationRepository.save(notifications);
    return users.length;
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
    const iconMap: Record<string, string> = {
      // Critical alerts
      [NotificationType.CRITICAL_NEGATIVE_FEEDBACK]: 'alert-circle',
      [NotificationType.CRITICAL_KEYWORDS]: 'warning',
      [NotificationType.LOW_SATISFACTION_SCORE]: 'trending-down',

      // Positive feedback
      [NotificationType.POSITIVE_FEEDBACK]: 'happy',
      [NotificationType.COMPLIMENT]: 'heart',

      // Admin & subscription
      [NotificationType.SUBSCRIPTION_EXPIRING]: 'time',
      [NotificationType.PAYMENT_CONFIRMED]: 'checkmark-circle',
      [NotificationType.TRIAL_ENDING]: 'hourglass',
      [NotificationType.ACCOUNT_BLOCKED]: 'lock-closed',
      [NotificationType.ACCOUNT_UNBLOCKED]: 'lock-open',

      // Performance
      [NotificationType.PERFORMANCE_DROP]: 'trending-down',
      [NotificationType.PERFORMANCE_IMPROVEMENT]: 'trending-up',
      [NotificationType.SHIFT_PERFORMANCE]: 'analytics',

      // Insights & reports
      [NotificationType.REPORT_READY]: 'document-text',
      [NotificationType.WEEKLY_SUMMARY]: 'calendar',
      [NotificationType.INSIGHT_ALERT]: 'bulb',

      // System
      [NotificationType.QR_FIRST_SCAN]: 'qr-code',
      [NotificationType.QR_SCAN_MILESTONE]: 'qr-code',
      [NotificationType.APP_UPDATE]: 'download',
      [NotificationType.SYSTEM]: 'settings',

      // Legacy
      [NotificationType.NEW_FEEDBACK]: 'chatbubble',
      [NotificationType.ACHIEVEMENT_UNLOCKED]: 'trophy',
      [NotificationType.RATING_ALERT]: 'star',
    };
    return iconMap[type] || 'notifications';
  }
}
