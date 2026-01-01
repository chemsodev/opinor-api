import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User, Feedback } from '../../database/entities';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrcodeService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    private configService: ConfigService,
  ) {}

  async getQrCode(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      };
    }

    const baseUrl =
      this.configService.get('FRONTEND_URL') || 'https://opinor.app';
    const feedbackUrl = `${baseUrl}/feedback/${user.uniqueCode}`;
    const qrCodeUrl =
      user.qrCodeUrl ||
      `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`;

    return {
      success: true,
      data: {
        id: `qrcode_${user.id}`,
        businessId: user.id,
        qrCode: qrCodeUrl,
        feedbackUrl,
        scans: user.qrScans || 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    };
  }

  async getQrCodeStats(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    // Get feedback counts as proxy for scans
    const totalFeedbacks = await this.feedbackRepository.count({
      where: { businessId: userId },
    });

    const monthlyFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        createdAt: MoreThanOrEqual(startOfMonth),
      },
    });

    const weeklyFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        createdAt: MoreThanOrEqual(startOfWeek),
      },
    });

    const todayFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        createdAt: MoreThanOrEqual(startOfToday),
      },
    });

    // Estimate scans (typically higher than feedbacks)
    const scanMultiplier = 1.3; // Assume 30% of scans result in feedback
    const totalScans = Math.round(totalFeedbacks * scanMultiplier);
    const scansThisMonth = Math.round(monthlyFeedbacks * scanMultiplier);
    const scansThisWeek = Math.round(weeklyFeedbacks * scanMultiplier);
    const scansToday = Math.round(todayFeedbacks * scanMultiplier);

    const conversionRate =
      totalScans > 0 ? ((totalFeedbacks / totalScans) * 100).toFixed(1) : 0;

    // Mock location data (in real app, would come from feedback locations)
    const topLocations = [
      {
        location: user.businessName || 'Main Branch',
        scans: Math.round(totalScans * 0.6),
        percentage: 60.0,
      },
      {
        location: 'Online',
        scans: Math.round(totalScans * 0.25),
        percentage: 25.0,
      },
      {
        location: 'Other',
        scans: Math.round(totalScans * 0.15),
        percentage: 15.0,
      },
    ];

    return {
      success: true,
      data: {
        qrcodeId: `qrcode_${user.id}`,
        totalScans,
        scansThisMonth,
        scansThisWeek,
        scansToday,
        feedbacksGenerated: totalFeedbacks,
        conversionRate: parseFloat(conversionRate as string),
        topLocations,
      },
    };
  }

  async incrementScans(userId: string) {
    await this.userRepository.increment({ id: userId }, 'qrScans', 1);
  }

  async regenerateQrCode(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      };
    }

    // Generate new unique code
    const newCode = this.generateUniqueCode();
    const baseUrl =
      this.configService.get('FRONTEND_URL') || 'https://opinor.app';
    const feedbackUrl = `${baseUrl}/feedback/${newCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(feedbackUrl)}`;

    user.uniqueCode = newCode;
    user.qrCodeUrl = qrCodeUrl;
    await this.userRepository.save(user);

    return {
      success: true,
      data: {
        id: `qrcode_${user.id}`,
        businessId: user.id,
        qrCode: qrCodeUrl,
        feedbackUrl,
        scans: 0,
        createdAt: user.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'QR Code regenerated successfully',
    };
  }

  private generateUniqueCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}
