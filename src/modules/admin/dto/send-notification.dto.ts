import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../../../database/entities/enums';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Important Update',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Notification message/body',
    example:
      'Your subscription will expire in 5 days. Please renew to continue using all features.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  message: string;

  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Type of notification (defaults to SYSTEM)',
    example: 'system',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Related feedback ID (optional)',
    example: 'uuid-of-feedback',
  })
  @IsOptional()
  @IsUUID()
  feedbackId?: string;
}

export class SendBulkNotificationDto {
  @ApiProperty({
    description: 'Array of user IDs to send notification to',
    example: ['user-uuid-1', 'user-uuid-2'],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiProperty({
    description: 'Notification title',
    example: 'System Maintenance',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Notification message/body',
    example:
      'The system will be under maintenance on January 5th from 2:00 AM to 4:00 AM.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  message: string;

  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Type of notification (defaults to SYSTEM)',
    example: 'system',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class SendToAllNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'New Feature Available',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Notification message/body',
    example:
      'We have added a new reporting feature! Check it out in the Reports section.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  message: string;

  @ApiPropertyOptional({
    enum: NotificationType,
    description: 'Type of notification (defaults to SYSTEM)',
    example: 'system',
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}
