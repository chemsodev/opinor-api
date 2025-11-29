import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType } from '../../../database/entities';

export class CreateUserDto {
  @ApiProperty({ example: 'business@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'My Restaurant' })
  @IsString()
  businessName: string;

  @ApiProperty({ enum: BusinessType, example: BusinessType.RESTAURANT })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '123 Main St, City' })
  @IsOptional()
  @IsString()
  address?: string;
}
