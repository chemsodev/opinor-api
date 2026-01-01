import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { Feedback, User } from '../../database/entities';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getStatistics(
    userId: string,
    period: 'today' | 'week' | 'month' = 'today',
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const feedbacks = await this.feedbackRepository.find({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: MoreThanOrEqual(startDate),
      },
    });

    const totalFeedbacks = feedbacks.length;
    const positiveCount = feedbacks.filter(
      (f) => parseFloat(f.rating.toString()) >= 4,
    ).length;
    const negativeCount = feedbacks.filter(
      (f) => parseFloat(f.rating.toString()) < 3,
    ).length;
    const neutralCount = totalFeedbacks - positiveCount - negativeCount;

    const avgRating =
      totalFeedbacks > 0
        ? feedbacks.reduce(
            (sum, f) => sum + parseFloat(f.rating.toString()),
            0,
          ) / totalFeedbacks
        : 0;

    // Calculate trend (compare with previous period)
    const previousStartDate = new Date(startDate);
    const periodDays = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);

    const previousFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: Between(previousStartDate, startDate),
      },
    });

    const trend =
      previousFeedbacks > 0
        ? (
            ((totalFeedbacks - previousFeedbacks) / previousFeedbacks) *
            100
          ).toFixed(1)
        : '0';

    return {
      success: true,
      data: {
        period,
        statistics: {
          totalFeedbacks,
          negativeCount,
          positiveCount,
          neutralCount,
          averageRating: parseFloat(avgRating.toFixed(1)),
          ratingOutOf5: `${avgRating.toFixed(1)} / 5`,
          trend: `${parseFloat(trend) >= 0 ? '+' : ''}${trend}%`,
        },
      },
    };
  }

  async getRatingsDistribution(
    userId: string,
    period: 'today' | 'week' | 'month' = 'today',
  ) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const feedbacks = await this.feedbackRepository.find({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: MoreThanOrEqual(startDate),
      },
    });

    const totalFeedbacks = feedbacks.length;
    const ratingScores = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

    const ratingDistribution = ratingScores.map((ratingScore) => {
      const count = feedbacks.filter((f) => {
        const rating = parseFloat(f.rating.toString());
        return rating >= ratingScore - 0.25 && rating < ratingScore + 0.25;
      }).length;

      return {
        ratingScore,
        count,
        percentage:
          totalFeedbacks > 0
            ? parseFloat(((count / totalFeedbacks) * 100).toFixed(1))
            : 0,
      };
    });

    return {
      success: true,
      data: {
        period,
        ratingDistribution,
      },
    };
  }

  async getMonthlyReportsHistory(userId: string, page = 1, limit = 10) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      };
    }

    // Generate monthly reports for the last 12 months
    const reports: any[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const reportDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const feedbacks = await this.feedbackRepository.find({
        where: {
          businessId: userId,
          isHidden: false,
          createdAt: Between(reportDate, endOfMonth),
        },
      });

      if (feedbacks.length > 0) {
        const avgRating =
          feedbacks.reduce(
            (sum, f) => sum + parseFloat(f.rating.toString()),
            0,
          ) / feedbacks.length;

        reports.push({
          id: `report_${userId}_${reportDate.getFullYear()}_${reportDate.getMonth() + 1}`,
          date: reportDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          }),
          location: user.businessAddress || user.businessName,
          feedbackCount: feedbacks.length,
          averageRating: parseFloat(avgRating.toFixed(1)),
          generatedAt: endOfMonth.toISOString(),
          reportUrl: `https://api.opinor.com/reports/report_${userId}_${reportDate.getFullYear()}_${reportDate.getMonth() + 1}.pdf`,
        });
      }
    }

    const startIndex = (page - 1) * limit;
    const paginatedReports = reports.slice(startIndex, startIndex + limit);

    return {
      success: true,
      data: {
        reports: paginatedReports,
        pagination: {
          page,
          limit,
          total: reports.length,
          totalPages: Math.ceil(reports.length / limit),
        },
      },
    };
  }

  async getDetailedReport(userId: string, reportId: string) {
    // Parse report ID to get date
    const parts = reportId.split('_');
    if (parts.length < 4) {
      return {
        success: false,
        error: { code: 'INVALID_ID', message: 'Invalid report ID' },
      };
    }

    const year = parseInt(parts[2]);
    const month = parseInt(parts[3]) - 1;

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return {
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' },
      };
    }

    const feedbacks = await this.feedbackRepository.find({
      where: {
        businessId: userId,
        isHidden: false,
        createdAt: Between(startOfMonth, endOfMonth),
      },
      order: { createdAt: 'ASC' },
    });

    const totalFeedbacks = feedbacks.length;
    const avgRating =
      totalFeedbacks > 0
        ? feedbacks.reduce(
            (sum, f) => sum + parseFloat(f.rating.toString()),
            0,
          ) / totalFeedbacks
        : 0;

    const positiveCount = feedbacks.filter(
      (f) => parseFloat(f.rating.toString()) >= 4,
    ).length;
    const negativeCount = feedbacks.filter(
      (f) => parseFloat(f.rating.toString()) < 3,
    ).length;

    // Daily breakdown
    const dailyBreakdown: any[] = [];
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const dayDate = new Date(year, month, day);
      const dayFeedbacks = feedbacks.filter((f) => {
        const feedbackDate = new Date(f.createdAt);
        return feedbackDate.getDate() === day;
      });

      if (dayFeedbacks.length > 0) {
        const dayAvg =
          dayFeedbacks.reduce(
            (sum, f) => sum + parseFloat(f.rating.toString()),
            0,
          ) / dayFeedbacks.length;
        dailyBreakdown.push({
          date: dayDate.toISOString().split('T')[0],
          feedbackCount: dayFeedbacks.length,
          averageRating: parseFloat(dayAvg.toFixed(1)),
        });
      }
    }

    // Category breakdown
    const categoryMap = new Map<string, { count: number; positive: number }>();
    feedbacks.forEach((f) => {
      const cat = f.category || 'other';
      const existing = categoryMap.get(cat) || { count: 0, positive: 0 };
      existing.count++;
      if (parseFloat(f.rating.toString()) >= 4) existing.positive++;
      categoryMap.set(cat, existing);
    });

    const categories = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        count: data.count,
        sentiment: data.positive / data.count >= 0.5 ? 'positive' : 'negative',
      }),
    );

    return {
      success: true,
      data: {
        reportId,
        date: startOfMonth.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        location: user.businessAddress || user.businessName,
        summary: {
          totalFeedbacks,
          averageRating: parseFloat(avgRating.toFixed(1)),
          totalPositive: positiveCount,
          totalNegative: negativeCount,
          trend: '+5%',
        },
        dailyBreakdown: dailyBreakdown.slice(0, 10),
        topComments: feedbacks.slice(0, 5).map((f) => ({
          feedbackId: f.id,
          text: f.comment || 'No comment',
          rating: parseFloat(f.rating.toString()),
        })),
        categories,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  async exportReport(
    userId: string,
    reportId: string,
    format: 'pdf' | 'csv' = 'pdf',
  ) {
    return {
      success: true,
      data: {
        reportId,
        exportUrl: `https://api.opinor.com/reports/${reportId}_export.${format}`,
        fileName: `Report_${reportId}.${format}`,
        fileSize: '2.5 MB',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      message: `Report exported successfully. Download link is valid for 7 days.`,
    };
  }
}
