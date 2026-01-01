import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { User } from '../../database/entities';

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('statistics')
  @ApiOperation({
    summary: 'Get statistics by period',
    description:
      'Returns feedback statistics for today, this week, or this month',
  })
  @ApiQuery({
    name: 'period',
    enum: ['today', 'week', 'month'],
    required: false,
    description: 'Time period for statistics',
  })
  @ApiOkResponse({
    description: 'Statistics data',
    schema: {
      example: {
        success: true,
        data: {
          period: 'week',
          totalFeedbacks: 45,
          averageRating: 4.3,
          positivePercentage: 78,
          negativePercentage: 8,
          neutralPercentage: 14,
          comparedToPrevious: '+12%',
        },
      },
    },
  })
  async getStatistics(
    @CurrentUser() user: User,
    @Query('period') period: 'today' | 'week' | 'month' = 'today',
  ) {
    return this.reportsService.getStatistics(user.id, period);
  }

  @Get('ratings-distribution')
  @ApiOperation({
    summary: 'Get ratings distribution',
    description: 'Returns the breakdown of feedback by star rating',
  })
  @ApiQuery({
    name: 'period',
    enum: ['today', 'week', 'month'],
    required: false,
    description: 'Time period for distribution',
  })
  @ApiOkResponse({
    description: 'Ratings distribution data',
    schema: {
      example: {
        success: true,
        data: {
          distribution: [
            { rating: 5, count: 25, percentage: 55.6 },
            { rating: 4, count: 12, percentage: 26.7 },
            { rating: 3, count: 5, percentage: 11.1 },
            { rating: 2, count: 2, percentage: 4.4 },
            { rating: 1, count: 1, percentage: 2.2 },
          ],
          total: 45,
        },
      },
    },
  })
  async getRatingsDistribution(
    @CurrentUser() user: User,
    @Query('period') period: 'today' | 'week' | 'month' = 'today',
  ) {
    return this.reportsService.getRatingsDistribution(user.id, period);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get monthly reports history',
    description: 'Returns list of available monthly reports',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({
    description: 'Monthly reports list',
    schema: {
      example: {
        success: true,
        data: {
          reports: [
            {
              id: '2025-12',
              month: 'December 2025',
              totalFeedbacks: 180,
              averageRating: 4.4,
              generatedAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          pagination: { page: 1, limit: 10, total: 6, totalPages: 1 },
        },
      },
    },
  })
  async getMonthlyReportsHistory(
    @CurrentUser() user: User,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reportsService.getMonthlyReportsHistory(user.id, +page, +limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get detailed monthly report',
    description: 'Returns comprehensive report for a specific month',
  })
  @ApiParam({
    name: 'id',
    description: 'Report ID (format: YYYY-MM)',
    example: '2025-12',
  })
  @ApiOkResponse({
    description: 'Detailed monthly report',
    schema: {
      example: {
        success: true,
        data: {
          id: '2025-12',
          month: 'December 2025',
          summary: {
            totalFeedbacks: 180,
            averageRating: 4.4,
            responseRate: 85,
          },
          dailyBreakdown: [],
          topCategories: [],
          sentimentAnalysis: {},
        },
      },
    },
  })
  async getDetailedReport(
    @CurrentUser() user: User,
    @Param('id') reportId: string,
  ) {
    return this.reportsService.getDetailedReport(user.id, reportId);
  }

  @Post(':id/export')
  @ApiOperation({
    summary: 'Export report',
    description: 'Export a monthly report as PDF or CSV file',
  })
  @ApiParam({
    name: 'id',
    description: 'Report ID (format: YYYY-MM)',
    example: '2025-12',
  })
  @ApiQuery({
    name: 'format',
    enum: ['pdf', 'csv'],
    required: false,
    description: 'Export format (default: pdf)',
  })
  @ApiOkResponse({
    description: 'Export download URL',
    schema: {
      example: {
        success: true,
        data: {
          downloadUrl: 'https://api.opinor.app/exports/report-2025-12.pdf',
          expiresAt: '2026-01-02T12:00:00.000Z',
        },
        message: 'Report exported successfully',
      },
    },
  })
  async exportReport(
    @CurrentUser() user: User,
    @Param('id') reportId: string,
    @Query('format') format: 'pdf' | 'csv' = 'pdf',
  ) {
    return this.reportsService.exportReport(user.id, reportId, format);
  }
}
