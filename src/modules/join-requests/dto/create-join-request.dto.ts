import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BusinessType } from '../../../database/entities';

export class CreateJoinRequestDto {
  @ApiProperty({
    example: 'business@example.com',
    description:
      'Business email address. Will receive invitation code upon approval.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'My Restaurant',
    description: 'Name of the business',
  })
  @IsString()
  businessName: string;

  @ApiProperty({
    enum: BusinessType,
    example: BusinessType.RESTAURANT,
    description: 'Type/category of the business',
  })
  @IsEnum(BusinessType)
  businessType: BusinessType;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: '123 Main St, City',
    description: 'Business address/location',
  })
  @IsOptional()
  @IsString()
  address?: string;
}
