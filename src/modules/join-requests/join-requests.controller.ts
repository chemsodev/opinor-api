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
  @ApiOperation({
    summary: 'Submit a join request (public)',
    description: `
Submit a new business join request. This is a public endpoint.

**Flow:**
1. Business submits their information
2. Admin receives an email notification at hello.opinor@workmail.com
3. Admin reviews and approves/rejects the request
4. If approved, business receives an invitation code via email
5. Business uses the code to complete registration

**Note:** Only one pending request per email is allowed.
    `,
  })
  @ApiResponse({
    status: 201,
    description:
      'Join request submitted successfully. Admin notified via email.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Join request submitted successfully. Please check your email for confirmation.',
        },
        code: {
          type: 'string',
          example: '123456',
          description:
            'Generated invitation code (for testing only, not shown in production)',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'A pending or approved request already exists for this email',
  })
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
  @ApiOperation({
    summary: 'Verify an invitation code (public)',
    description:
      'Check if an invitation code is valid and can be used for registration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Code verification result',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
        status: {
          type: 'string',
          enum: [
            'PENDING',
            'APPROVED',
            'REJECTED',
            'NOT_FOUND',
            'ALREADY_USED',
          ],
        },
        email: {
          type: 'string',
          example: 'business@example.com',
          description: 'Email associated with the code (only if valid)',
        },
      },
    },
  })
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
  @ApiOperation({
    summary: 'Review a join request (admin only)',
    description: `
Approve or reject a pending join request.

**On Approval:**
- The business receives an email with their invitation code
- The code is valid for 24 hours
- Business can use the code to complete registration

**On Rejection:**
- Optional rejection reason can be provided
- Business does not receive any notification (admin may contact them separately)
    `,
  })
  @ApiResponse({
    status: 200,
    description:
      'Join request reviewed successfully. If approved, invitation code sent via email.',
  })
  @ApiResponse({
    status: 400,
    description: 'Request has already been reviewed',
  })
  @ApiResponse({ status: 404, description: 'Join request not found' })
  async review(
    @Param('id') id: string,
    @Body() reviewDto: ReviewJoinRequestDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.joinRequestsService.review(id, reviewDto, adminId);
  }
}
