import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  UpdateUserDto,
  UpdateProfileDto,
  UpdateBusinessInfoDto,
  UpdateSettingsDto,
} from './dto';
import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../../database/entities';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description:
      'Returns the complete profile of the authenticated business owner',
  })
  @ApiOkResponse({
    description: 'User profile data',
    schema: {
      example: {
        success: true,
        data: {
          id: 'uuid',
          email: 'owner@business.com',
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'https://example.com/avatar.jpg',
          businessName: 'My Restaurant',
          businessType: 'RESTAURANT',
          phone: '+1234567890',
          createdAt: '2025-06-15T10:00:00.000Z',
        },
      },
    },
  })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfileResponse(user.id);
  }

  @Put('profile')
  @ApiOperation({
    summary: 'Update profile (legacy)',
    description: 'Full update of user profile - use PATCH for partial updates',
  })
  @ApiOkResponse({ description: 'Profile updated successfully' })
  async updateProfileLegacy(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user.id, updateUserDto);
  }

  @Patch('profile')
  @ApiOperation({
    summary: 'Update profile',
    description: 'Partial update of user profile (name, avatar)',
  })
  @ApiOkResponse({
    description: 'Profile updated',
    schema: {
      example: {
        success: true,
        message: 'Profile updated successfully',
      },
    },
  })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }

  @Patch('business-info')
  @ApiOperation({
    summary: 'Update business info',
    description: 'Update business details (name, address, category, logo)',
  })
  @ApiOkResponse({
    description: 'Business info updated',
    schema: {
      example: {
        success: true,
        message: 'Business info updated successfully',
      },
    },
  })
  async updateBusinessInfo(
    @CurrentUser() user: User,
    @Body() updateBusinessInfoDto: UpdateBusinessInfoDto,
  ) {
    return this.usersService.updateBusinessInfo(user.id, updateBusinessInfoDto);
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'Update settings',
    description: 'Update notification and display preferences',
  })
  @ApiOkResponse({
    description: 'Settings updated',
    schema: {
      example: {
        success: true,
        message: 'Settings updated successfully',
      },
    },
  })
  async updateSettings(
    @CurrentUser() user: User,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.usersService.updateSettings(user.id, updateSettingsDto);
  }

  @Get('settings')
  @ApiOperation({
    summary: 'Get settings',
    description: 'Returns current notification and display settings',
  })
  @ApiOkResponse({
    description: 'User settings',
    schema: {
      example: {
        success: true,
        data: {
          language: 'en',
          theme: 'light',
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          emailFrequency: 'daily',
        },
      },
    },
  })
  async getSettings(@CurrentUser() user: User) {
    return this.usersService.getSettingsResponse(user.id);
  }
}
