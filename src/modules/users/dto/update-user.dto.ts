import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Paul' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Barista' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UpdateBusinessInfoDto {
  @ApiPropertyOptional({ example: "Paul's Coffee" })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiPropertyOptional({ example: 'Café/Coffee Shop' })
  @IsString()
  @IsOptional()
  businessCategory?: string;

  @ApiPropertyOptional({ example: '123 Main St, City, Country' })
  @IsString()
  @IsOptional()
  businessAddress?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  businessPhone?: string;

  @ApiPropertyOptional({ example: 'contact@paulscoffee.com' })
  @IsString()
  @IsOptional()
  businessEmail?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsString()
  @IsOptional()
  logo?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'en' })
  @IsString()
  @IsOptional()
  @IsIn(['en', 'fr', 'ar', 'es'])
  language?: string;

  @ApiPropertyOptional({ example: 'light' })
  @IsString()
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ example: 'daily' })
  @IsString()
  @IsOptional()
  @IsIn(['realtime', 'daily', 'weekly', 'never'])
  emailFrequency?: string;
}
