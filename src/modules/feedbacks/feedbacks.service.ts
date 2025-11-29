import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Feedback, User } from '../../database/entities';
import { CreateFeedbackDto, FeedbackQueryDto } from './dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class FeedbacksService {
  constructor(
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    businessCode: string,
    createFeedbackDto: CreateFeedbackDto,
    ipAddress: string,
  ): Promise<Feedback> {
    // Find business by unique code
    const business = await this.usersService.findByUniqueCode(businessCode);
    if (!business || !business.isActive) {
      throw new NotFoundException('Business not found or inactive');
    }

    // Check rate limiting - 1 feedback per IP per business per 24h
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const recentFeedback = await this.feedbackRepository.findOne({
      where: {
        businessId: business.id,
        ipAddress,
        createdAt: MoreThan(twentyFourHoursAgo),
      },
    });

    if (recentFeedback) {
      throw new BadRequestException(
        'You have already submitted feedback for this business in the last 24 hours',
      );
    }

    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      businessId: business.id,
      ipAddress,
    });

    return this.feedbackRepository.save(feedback);
  }

  async findAllForBusiness(
    businessId: string,
    queryDto: FeedbackQueryDto,
  ): Promise<{ data: Feedback[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, rating } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { businessId, isHidden: false };
    if (rating) {
      where.rating = rating;
    }

    const [data, total] = await this.feedbackRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findById(id: string, businessId: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id, businessId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    return feedback;
  }

  async getPublicStats(
    businessCode: string,
  ): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
  }> {
    const business = await this.usersService.findByUniqueCode(businessCode);
    if (!business || !business.isActive) {
      throw new NotFoundException('Business not found or inactive');
    }

    const stats = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'averageRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('feedback.business_id = :businessId', { businessId: business.id })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .getRawOne();

    // Get rating distribution
    const distribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.business_id = :businessId', { businessId: business.id })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .groupBy('feedback.rating')
      .getRawMany();

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    distribution.forEach((item) => {
      ratingDistribution[item.rating] = parseInt(item.count, 10);
    });

    return {
      averageRating: parseFloat(stats.averageRating) || 0,
      totalReviews: parseInt(stats.totalReviews, 10) || 0,
      ratingDistribution,
    };
  }

  async getStatsForBusiness(businessId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
    recentTrend: { date: string; count: number; avgRating: number }[];
  }> {
    const stats = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'averageRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .where('feedback.business_id = :businessId', { businessId })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .getRawOne();

    // Get rating distribution
    const distribution = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('feedback.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('feedback.business_id = :businessId', { businessId })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .groupBy('feedback.rating')
      .getRawMany();

    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    distribution.forEach((item) => {
      ratingDistribution[item.rating] = parseInt(item.count, 10);
    });

    // Get recent trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trend = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('DATE(feedback.created_at)', 'date')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(feedback.rating)', 'avgRating')
      .where('feedback.business_id = :businessId', { businessId })
      .andWhere('feedback.is_hidden = :isHidden', { isHidden: false })
      .andWhere('feedback.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .groupBy('DATE(feedback.created_at)')
      .orderBy('DATE(feedback.created_at)', 'ASC')
      .getRawMany();

    const recentTrend = trend.map((item) => ({
      date: item.date,
      count: parseInt(item.count, 10),
      avgRating: parseFloat(item.avgRating),
    }));

    return {
      averageRating: parseFloat(stats.averageRating) || 0,
      totalReviews: parseInt(stats.totalReviews, 10) || 0,
      ratingDistribution,
      recentTrend,
    };
  }

  async hideFeedback(id: string, businessId: string): Promise<Feedback> {
    const feedback = await this.findById(id, businessId);
    feedback.isHidden = true;
    return this.feedbackRepository.save(feedback);
  }

  async unhideFeedback(id: string, businessId: string): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id, businessId },
    });

    if (!feedback) {
      throw new NotFoundException('Feedback not found');
    }

    feedback.isHidden = false;
    return this.feedbackRepository.save(feedback);
  }
}
