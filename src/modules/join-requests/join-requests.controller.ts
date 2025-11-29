import {
  Controller,
  Post,
  Get,
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
import { JoinRequestsService } from './join-requests.service';
import { CreateJoinRequestDto, ReviewJoinRequestDto } from './dto';
import { AdminJwtAuthGuard } from '../auth/guards';
import { CurrentUser, Public } from '../../common/decorators';
import { JoinRequestStatus } from '../../database/entities';

@ApiTags('Join Requests')
@Controller('join-requests')
export class JoinRequestsController {
  constructor(private readonly joinRequestsService: JoinRequestsService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit a join request (public)' })
  @ApiResponse({
    status: 201,
    description: 'Join request submitted successfully',
  })
  @ApiResponse({ status: 409, description: 'Request already exists' })
  async create(@Body() createJoinRequestDto: CreateJoinRequestDto) {
    const joinRequest =
      await this.joinRequestsService.create(createJoinRequestDto);
    return {
      message:
        'Join request submitted successfully. Please check your email for confirmation.',
      code: joinRequest.generatedCode,
    };
  }

  @Public()
  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify an invitation code (public)' })
  @ApiResponse({ status: 200, description: 'Code verification result' })
  async verifyCode(@Param('code') code: string) {
    return this.joinRequestsService.verifyCode(code);
  }

  @Get()
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all join requests (admin only)' })
  @ApiQuery({ name: 'status', enum: JoinRequestStatus, required: false })
  @ApiResponse({ status: 200, description: 'Returns all join requests' })
  async findAll(@Query('status') status?: JoinRequestStatus) {
    return this.joinRequestsService.findAll(status);
  }

  @Get(':id')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific join request (admin only)' })
  @ApiResponse({ status: 200, description: 'Returns the join request' })
  @ApiResponse({ status: 404, description: 'Join request not found' })
  async findOne(@Param('id') id: string) {
    return this.joinRequestsService.findById(id);
  }

  @Patch(':id/review')
  @UseGuards(AdminJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Review a join request (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Join request reviewed successfully',
  })
  @ApiResponse({ status: 400, description: 'Request already reviewed' })
  @ApiResponse({ status: 404, description: 'Join request not found' })
  async review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewJoinRequestDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.joinRequestsService.review(id, reviewDto, adminId);
  }
}
