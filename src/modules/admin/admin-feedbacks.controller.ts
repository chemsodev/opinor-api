import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../../common/decorators';
import { AdminFeedbacksService } from './admin-feedbacks.service';
import { ReplyFeedbackDto } from './dto';

@ApiTags('Admin - Feedbacks')
@ApiBearerAuth('access-token')
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/feedbacks')
export class AdminFeedbacksController {
  constructor(private readonly adminFeedbacksService: AdminFeedbacksService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all feedbacks (admin)',
    description:
      'Retrieve all feedbacks across all businesses with filtering and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({
    name: 'businessId',
    required: false,
    type: String,
    description: 'Filter by business ID',
  })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
    description: 'Filter by rating (1-5)',
  })
  @ApiQuery({
    name: 'sentiment',
    required: false,
    type: String,
    description: 'Filter by sentiment',
  })
  @ApiQuery({
    name: 'hasAdminReply',
    required: false,
    type: Boolean,
    description: 'Filter by admin reply status',
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    type: Boolean,
    description: 'Include soft-deleted feedbacks',
  })
  @ApiResponse({ status: 200, description: 'List of all feedbacks' })
  async getAllFeedbacks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('businessId') businessId?: string,
    @Query('rating') rating?: number,
    @Query('sentiment') sentiment?: string,
    @Query('hasAdminReply') hasAdminReply?: boolean,
    @Query('includeDeleted') includeDeleted?: boolean,
  ) {
    return this.adminFeedbacksService.getAllFeedbacks({
      page: page || 1,
      limit: limit || 20,
      businessId,
      rating,
      sentiment,
      hasAdminReply,
      includeDeleted,
    });
  }

  @Get('statistics')
  @ApiOperation({
    summary: 'Get global feedback statistics (admin)',
    description: 'Get aggregated statistics across all businesses',
  })
  @ApiResponse({ status: 200, description: 'Global statistics' })
  async getGlobalStatistics() {
    return this.adminFeedbacksService.getGlobalStatistics();
  }

  @Get('business/:businessId')
  @ApiOperation({
    summary: 'Get specific business feedbacks (admin)',
    description: 'Get all feedbacks for a specific business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'rating', required: false, type: Number })
  @ApiQuery({ name: 'sentiment', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Business feedbacks' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessFeedbacks(
    @Param('businessId', ParseUUIDPipe) businessId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('rating') rating?: number,
    @Query('sentiment') sentiment?: string,
  ) {
    return this.adminFeedbacksService.getBusinessFeedbacks(businessId, {
      page: page || 1,
      limit: limit || 20,
      rating,
      sentiment,
    });
  }

  @Get('business/:businessId/statistics')
  @ApiOperation({
    summary: 'Get specific business statistics (admin)',
    description: 'Get detailed statistics for a specific business',
  })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiResponse({ status: 200, description: 'Business statistics' })
  @ApiResponse({ status: 404, description: 'Business not found' })
  async getBusinessStatistics(
    @Param('businessId', ParseUUIDPipe) businessId: string,
  ) {
    return this.adminFeedbacksService.getBusinessStatistics(businessId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get feedback details (admin)',
    description: 'Get detailed feedback information including business details',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Feedback details' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async getFeedbackById(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminFeedbacksService.getFeedbackById(id);
  }

  @Post(':id/reply')
  @ApiOperation({
    summary: 'Reply to feedback (admin)',
    description:
      'Add an admin reply to a feedback. Business owner can view this reply.',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Reply added successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async replyToFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() replyDto: ReplyFeedbackDto,
    @CurrentUser() admin: any,
  ) {
    return this.adminFeedbacksService.replyToFeedback(
      id,
      replyDto.reply,
      admin.id,
    );
  }

  @Delete(':id/reply')
  @ApiOperation({
    summary: 'Delete admin reply (admin)',
    description: 'Remove admin reply from a feedback',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Reply deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async deleteReply(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminFeedbacksService.deleteReply(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete feedback (admin)',
    description: 'Mark feedback as deleted without removing from database',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async softDeleteFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: any,
  ) {
    return this.adminFeedbacksService.softDeleteFeedback(id, admin.id);
  }

  @Patch(':id/restore')
  @ApiOperation({
    summary: 'Restore deleted feedback (admin)',
    description: 'Restore a soft-deleted feedback',
  })
  @ApiParam({ name: 'id', description: 'Feedback ID' })
  @ApiResponse({ status: 200, description: 'Feedback restored successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  async restoreFeedback(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminFeedbacksService.restoreFeedback(id);
  }
}
