import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FeedbacksService } from './feedbacks.service';
import {
  CreateFeedbackDto,
  FeedbackQueryDto,
  RespondToFeedbackDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser, Public, ClientIp } from '../../common/decorators';
import { User } from '../../database/entities';

@ApiTags('Feedbacks')
@Controller('feedbacks')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  // Public endpoints
  @Public()
  @Post(':businessCode')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit feedback for a business (public)' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 400, description: 'Rate limited or invalid data' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async create(
    @Param('businessCode') businessCode: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
    @ClientIp() ipAddress: string,
  ) {
    const feedback = await this.feedbacksService.create(
      businessCode,
      createFeedbackDto,
      ipAddress,
    );
    return {
      success: true,
      data: { id: feedback.id },
      message: 'Thank you for your feedback!',
    };
  }

  @Public()
  @Get('business/:businessCode/stats')
  @ApiOperation({ summary: 'Get public stats for a business' })
  @ApiResponse({ status: 200, description: 'Returns public statistics' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getPublicStats(@Param('businessCode') businessCode: string) {
    return this.feedbacksService.getPublicStats(businessCode);
  }

  // Protected endpoints (business owner)
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own business feedbacks (paginated)' })
  @ApiResponse({ status: 200, description: 'Returns paginated feedbacks' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'rating', required: false })
  @ApiQuery({
    name: 'sentiment',
    required: false,
    enum: ['positive', 'negative', 'neutral'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['new', 'viewed', 'responded', 'archived'],
  })
  async findAll(
    @CurrentUser() user: User,
    @Query() queryDto: FeedbackQueryDto,
  ) {
    return this.feedbacksService.findAllForBusiness(user.id, queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own business statistics' })
  @ApiResponse({ status: 200, description: 'Returns business statistics' })
  async getStats(@CurrentUser() user: User) {
    return this.feedbacksService.getStatsForBusiness(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific feedback' })
  @ApiResponse({ status: 200, description: 'Returns the feedback' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.feedbacksService.findByIdFormatted(id, user.id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update feedback status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body('status') status: string,
  ) {
    return this.feedbacksService.updateStatus(id, user.id, status);
  }
}
