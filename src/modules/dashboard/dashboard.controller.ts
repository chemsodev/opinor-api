import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../database/entities';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Get dashboard summary',
    description:
      'Returns average rating, total feedbacks for today/week/month, and last update time',
  })
  @ApiOkResponse({
    description: 'Dashboard summary data',
    schema: {
      example: {
        success: true,
        data: {
          averageRating: 4.5,
          totalFeedbacksToday: 12,
          totalFeedbacksThisWeek: 45,
          totalFeedbacksThisMonth: 180,
          lastUpdated: '2026-01-01T12:00:00.000Z',
        },
      },
    },
  })
  async getSummary(@CurrentUser() user: User) {
    return this.dashboardService.getSummary(user.id);
  }

  @Get('feedback-chart')
  @ApiOperation({
    summary: 'Get feedback trend chart data',
    description:
      'Returns daily feedback count and average rating for the last 7 or 30 days',
  })
  @ApiQuery({
    name: 'period',
    enum: ['week', 'month'],
    required: false,
    description: 'Time period: week (7 days) or month (30 days)',
  })
  @ApiOkResponse({
    description: 'Feedback trend data',
    schema: {
      example: {
        success: true,
        data: {
          period: 'week',
          feedbackTrend: [
            { date: '2025-12-26', count: 5, averageRating: 4.2 },
            { date: '2025-12-27', count: 8, averageRating: 4.5 },
          ],
        },
      },
    },
  })
  async getFeedbackChart(
    @CurrentUser() user: User,
    @Query('period') period: 'week' | 'month' = 'week',
  ) {
    return this.dashboardService.getFeedbackChart(user.id, period);
  }

  @Get('achievements')
  @ApiOperation({
    summary: 'Get user achievements',
    description: 'Returns list of unlocked achievements and badges',
  })
  @ApiOkResponse({
    description: 'User achievements list',
    schema: {
      example: {
        success: true,
        data: {
          achievements: [
            {
              id: 'uuid',
              title: 'Rising Star',
              description: 'Received 100 feedbacks this month',
              icon: 'star',
              badgeColor: '#FFD700',
              unlockedAt: '2026-01-01T10:00:00.000Z',
              progress: 100,
            },
          ],
        },
      },
    },
  })
  async getAchievements(@CurrentUser() user: User) {
    return this.dashboardService.getAchievements(user.id);
  }
}
