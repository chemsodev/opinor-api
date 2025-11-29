import {
  Controller,
  Post,
  Get,
  Delete,
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
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FeedbacksService } from './feedbacks.service';
import { CreateFeedbackDto, FeedbackQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser, Public, ClientIp } from '../../common/decorators';

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
      message: 'Thank you for your feedback!',
      id: feedback.id,
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
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() queryDto: FeedbackQueryDto,
  ) {
    return this.feedbacksService.findAllForBusiness(userId, queryDto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own business statistics' })
  @ApiResponse({ status: 200, description: 'Returns business statistics' })
  async getStats(@CurrentUser('id') userId: string) {
    return this.feedbacksService.getStatsForBusiness(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific feedback' })
  @ApiResponse({ status: 200, description: 'Returns the feedback' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.feedbacksService.findById(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hide a feedback (soft delete)' })
  @ApiResponse({ status: 200, description: 'Feedback hidden successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async hide(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.feedbacksService.hideFeedback(id, userId);
    return { message: 'Feedback hidden successfully' };
  }
}
