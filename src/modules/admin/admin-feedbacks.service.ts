import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Between } from 'typeorm';
import { Feedback, User } from '../../database/entities';
import { NotificationsService } from '../notifications/notifications.service';

interface GetAllFeedbacksParams {
  page: number;
  limit: number;
  businessId?: string;
  rating?: number;
  sentiment?: string;
  hasAdminReply?: boolean;
  includeDeleted?: boolean;
}

@Injectable()
export class AdminFeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllFeedbacks(params: GetAllFeedbacksParams) {
    const {
      page,
      limit,
      businessId,
      rating,
      sentiment,
      hasAdminReply,
      includeDeleted,
    } = params;

    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoinAndSelect('feedback.business', 'business')
      .select([
        'feedback.id',
        'feedback.rating',
        'feedback.comment',
        'feedback.customerName',
        'feedback.sentiment',
        'feedback.category',
        'feedback.status',
        'feedback.adminReply',
        'feedback.adminReplyAt',
        'feedback.adminReplyBy',
        'feedback.deletedAt',
        'feedback.deletedBy',
        'feedback.createdAt',
        'feedback.updatedAt',
        'business.id',
        'business.businessName',
        'business.email',
      ]);

    // Filter deleted feedbacks unless explicitly included
    if (!includeDeleted) {
      queryBuilder.where('feedback.deletedAt IS NULL');
    }

    // Apply filters
    if (businessId) {
      queryBuilder.andWhere('feedback.businessId = :businessId', {
        businessId,
      });
    }

    if (rating) {
      queryBuilder.andWhere('feedback.rating = :rating', { rating });
    }

    if (sentiment) {
      queryBuilder.andWhere('feedback.sentiment = :sentiment', { sentiment });
    }

    if (hasAdminReply !== undefined) {
      if (hasAdminReply) {
        queryBuilder.andWhere('feedback.adminReply IS NOT NULL');
      } else {
        queryBuilder.andWhere('feedback.adminReply IS NULL');
      }
    }

    // Order and paginate
    queryBuilder
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [feedbacks, total] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      data: {
        feedbacks: feedbacks.map((f) => ({
          id: f.id,
          rating: f.rating,
          comment: f.comment,
          customerName: f.customerName,
          sentiment: f.sentiment,
          category: f.category,
          status: f.status,
          adminReply: f.adminReply,
          adminReplyAt: f.adminReplyAt?.toISOString(),
          isDeleted: !!f.deletedAt,
          deletedAt: f.deletedAt?.toISOString(),
          createdAt: f.createdAt.toISOString(),
          business: f.business
            ? {
                id: f.business.id,
                name: f.business.businessName,
                email: f.business.email,
              }
            : null,
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

  async getGlobalStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Total feedbacks (excluding deleted)
    const totalFeedbacks = await this.feedbackRepository.count({
      where: { deletedAt: IsNull() },
    });

    // This month
    const thisMonthFeedbacks = await this.feedbackRepository.count({
      where: {
        deletedAt: IsNull(),
        createdAt: Between(startOfMonth, now),
      },
    });

    // Last month
    const lastMonthFeedbacks = await this.feedbackRepository.count({
      where: {
        deletedAt: IsNull(),
        createdAt: Between(startOfLastMonth, endOfLastMonth),
      },
    });

    // This week
    const thisWeekFeedbacks = await this.feedbackRepository.count({
      where: {
        deletedAt: IsNull(),
        createdAt: Between(startOfWeek, now),
      },
    });

    // Average rating
    const avgResult = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'avg')
      .where('feedback.deletedAt IS NULL')
      .getRawOne();
    const averageRating = parseFloat(avgResult?.avg || '0').toFixed(2);

    // Rating distribution
    const ratingDistribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.deletedAt IS NULL')
      .groupBy('feedback.rating')
      .orderBy('feedback.rating', 'DESC')
      .getRawMany();

    // Sentiment distribution
    const sentimentDistribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.sentiment', 'sentiment')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.deletedAt IS NULL')
      .groupBy('feedback.sentiment')
      .getRawMany();

    // Feedbacks with admin replies
    const withAdminReply = await this.feedbackRepository.count({
      where: {
        deletedAt: IsNull(),
        adminReply: Not(IsNull()),
      },
    });

    // Deleted feedbacks count
    const deletedFeedbacks = await this.feedbackRepository.count({
      where: { deletedAt: Not(IsNull()) },
    });

    // Total businesses
    const totalBusinesses = await this.userRepository.count({
      where: { isActive: true },
    });

    // Top businesses by feedback count
    const topBusinesses = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .leftJoin('feedback.business', 'business')
      .select('business.id', 'businessId')
      .addSelect('business.businessName', 'businessName')
      .addSelect('COUNT(*)', 'feedbackCount')
      .addSelect('AVG(feedback.rating)', 'avgRating')
      .where('feedback.deletedAt IS NULL')
      .groupBy('business.id')
      .addGroupBy('business.businessName')
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const count = await this.feedbackRepository.count({
        where: {
          deletedAt: IsNull(),
          createdAt: Between(monthStart, monthEnd),
        },
      });

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        count,
      });
    }

    return {
      success: true,
      data: {
        overview: {
          totalFeedbacks,
          thisMonthFeedbacks,
          lastMonthFeedbacks,
          thisWeekFeedbacks,
          monthOverMonthChange: lastMonthFeedbacks
            ? (
                ((thisMonthFeedbacks - lastMonthFeedbacks) /
                  lastMonthFeedbacks) *
                100
              ).toFixed(1)
            : 0,
          averageRating: parseFloat(averageRating),
          totalBusinesses,
          withAdminReply,
          deletedFeedbacks,
        },
        ratingDistribution: ratingDistribution.map((r) => ({
          rating: parseInt(r.rating),
          count: parseInt(r.count),
        })),
        sentimentDistribution: sentimentDistribution.map((s) => ({
          sentiment: s.sentiment,
          count: parseInt(s.count),
        })),
        topBusinesses: topBusinesses.map((b) => ({
          id: b.businessId,
          name: b.businessName,
          feedbackCount: parseInt(b.feedbackCount),
          avgRating: parseFloat(b.avgRating || '0').toFixed(2),
        })),
        monthlyTrend,
      },
    };
  }

  async getFeedbackById(id: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
      relations: ['business'],
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return {
      success: true,
      data: {
        id: feedback.id,
        rating: feedback.rating,
        comment: feedback.comment,
        customerName: feedback.customerName,
        customerEmail: feedback.customerEmail,
        sentiment: feedback.sentiment,
        category: feedback.category,
        status: feedback.status,
        location: feedback.location,
        tags: feedback.tags,
        images: feedback.images,
        responseText: feedback.responseText,
        respondedAt: feedback.respondedAt?.toISOString(),
        adminReply: feedback.adminReply,
        adminReplyAt: feedback.adminReplyAt?.toISOString(),
        adminReplyBy: feedback.adminReplyBy,
        isDeleted: !!feedback.deletedAt,
        deletedAt: feedback.deletedAt?.toISOString(),
        deletedBy: feedback.deletedBy,
        createdAt: feedback.createdAt.toISOString(),
        business: feedback.business
          ? {
              id: feedback.business.id,
              name: feedback.business.businessName,
              email: feedback.business.email,
              businessType: feedback.business.businessType,
            }
          : null,
      },
    };
  }

  async replyToFeedback(feedbackId: string, reply: string, adminId: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.adminReply = reply;
    feedback.adminReplyAt = new Date();
    feedback.adminReplyBy = adminId;

    await this.feedbackRepository.save(feedback);

    // Notify the business owner
    await this.notificationsService.notifyAdminReply(
      feedback.businessId,
      feedbackId,
    );

    return {
      success: true,
      data: {
        id: feedback.id,
        adminReply: feedback.adminReply,
        adminReplyAt: feedback.adminReplyAt.toISOString(),
      },
      message: 'Reply added successfully',
    };
  }

  async deleteReply(feedbackId: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.adminReply = null;
    feedback.adminReplyAt = null;
    feedback.adminReplyBy = null;

    await this.feedbackRepository.save(feedback);

    return {
      success: true,
      message: 'Reply deleted successfully',
    };
  }

  async softDeleteFeedback(feedbackId: string, adminId: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.deletedAt = new Date();
    feedback.deletedBy = adminId;

    await this.feedbackRepository.save(feedback);

    return {
      success: true,
      message: 'Feedback deleted successfully',
    };
  }

  async restoreFeedback(feedbackId: string) {
    const feedback = await this.feedbackRepository.findOne({
      where: { id: feedbackId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.deletedAt = null;
    feedback.deletedBy = null;

    await this.feedbackRepository.save(feedback);

    return {
      success: true,
      message: 'Feedback restored successfully',
    };
  }

  // Get specific business feedbacks for admin
  async getBusinessFeedbacks(
    businessId: string,
    params: {
      page: number;
      limit: number;
      rating?: number;
      sentiment?: string;
    },
  ) {
    const { page, limit, rating, sentiment } = params;

    // Verify business exists
    const business = await this.userRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const queryBuilder = this.feedbackRepository
      .createQueryBuilder('feedback')
      .where('feedback.businessId = :businessId', { businessId })
      .andWhere('feedback.deletedAt IS NULL');

    if (rating) {
      queryBuilder.andWhere('feedback.rating = :rating', { rating });
    }

    if (sentiment) {
      queryBuilder.andWhere('feedback.sentiment = :sentiment', { sentiment });
    }

    queryBuilder
      .orderBy('feedback.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [feedbacks, total] = await queryBuilder.getManyAndCount();

    return {
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.businessName,
          email: business.email,
          businessType: business.businessType,
        },
        feedbacks: feedbacks.map((f) => ({
          id: f.id,
          rating: f.rating,
          comment: f.comment,
          customerName: f.customerName,
          sentiment: f.sentiment,
          category: f.category,
          status: f.status,
          adminReply: f.adminReply,
          adminReplyAt: f.adminReplyAt?.toISOString(),
          createdAt: f.createdAt.toISOString(),
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

  // Get specific business statistics for admin
  async getBusinessStatistics(businessId: string) {
    // Verify business exists
    const business = await this.userRepository.findOne({
      where: { id: businessId },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Total feedbacks
    const totalFeedbacks = await this.feedbackRepository.count({
      where: { businessId, deletedAt: IsNull() },
    });

    // This month
    const thisMonthFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId,
        deletedAt: IsNull(),
        createdAt: Between(startOfMonth, now),
      },
    });

    // Last month
    const lastMonthFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId,
        deletedAt: IsNull(),
        createdAt: Between(startOfLastMonth, endOfLastMonth),
      },
    });

    // This week
    const thisWeekFeedbacks = await this.feedbackRepository.count({
      where: {
        businessId,
        deletedAt: IsNull(),
        createdAt: Between(startOfWeek, now),
      },
    });

    // Average rating
    const avgResult = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'avg')
      .where('feedback.businessId = :businessId', { businessId })
      .andWhere('feedback.deletedAt IS NULL')
      .getRawOne();
    const averageRating = parseFloat(avgResult?.avg || '0').toFixed(2);

    // Rating distribution
    const ratingDistribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.businessId = :businessId', { businessId })
      .andWhere('feedback.deletedAt IS NULL')
      .groupBy('feedback.rating')
      .orderBy('feedback.rating', 'DESC')
      .getRawMany();

    // Sentiment distribution
    const sentimentDistribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.sentiment', 'sentiment')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.businessId = :businessId', { businessId })
      .andWhere('feedback.deletedAt IS NULL')
      .groupBy('feedback.sentiment')
      .getRawMany();

    // Category distribution
    const categoryDistribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.businessId = :businessId', { businessId })
      .andWhere('feedback.deletedAt IS NULL')
      .groupBy('feedback.category')
      .getRawMany();

    // Monthly trend (last 6 months)
    const monthlyTrend: { month: string; count: number; avgRating: number }[] =
      [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthStats = await this.feedbackRepository
        .createQueryBuilder('feedback')
        .select('COUNT(*)', 'count')
        .addSelect('AVG(feedback.rating)', 'avgRating')
        .where('feedback.businessId = :businessId', { businessId })
        .andWhere('feedback.deletedAt IS NULL')
        .andWhere('feedback.createdAt BETWEEN :start AND :end', {
          start: monthStart,
          end: monthEnd,
        })
        .getRawOne();

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        count: parseInt(monthStats?.count || '0'),
        avgRating: parseFloat(monthStats?.avgRating || '0'),
      });
    }

    // Admin replies count
    const withAdminReply = await this.feedbackRepository.count({
      where: {
        businessId,
        deletedAt: IsNull(),
        adminReply: Not(IsNull()),
      },
    });

    return {
      success: true,
      data: {
        business: {
          id: business.id,
          name: business.businessName,
          email: business.email,
          businessType: business.businessType,
          isActive: business.isActive,
          isBlocked: business.isBlocked,
          createdAt: business.createdAt.toISOString(),
        },
        overview: {
          totalFeedbacks,
          thisMonthFeedbacks,
          lastMonthFeedbacks,
          thisWeekFeedbacks,
          monthOverMonthChange: lastMonthFeedbacks
            ? (
                ((thisMonthFeedbacks - lastMonthFeedbacks) /
                  lastMonthFeedbacks) *
                100
              ).toFixed(1)
            : '0',
          averageRating: parseFloat(averageRating),
          withAdminReply,
        },
        ratingDistribution: ratingDistribution.map((r) => ({
          rating: parseInt(r.rating),
          count: parseInt(r.count),
        })),
        sentimentDistribution: sentimentDistribution.map((s) => ({
          sentiment: s.sentiment,
          count: parseInt(s.count),
        })),
        categoryDistribution: categoryDistribution.map((c) => ({
          category: c.category,
          count: parseInt(c.count),
        })),
        monthlyTrend,
      },
    };
  }
}
