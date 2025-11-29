import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto';
import { CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    const user = await this.usersService.findById(userId);
    const {
      password,
      refreshToken,
      passwordResetToken,
      passwordResetExpires,
      ...result
    } = user;
    return result;
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(userId, updateUserDto);
    const {
      password,
      refreshToken,
      passwordResetToken,
      passwordResetExpires,
      ...result
    } = user;
    return result;
  }
}
