import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeedbackCategory } from '../../../database/entities/enums';
import { Type } from 'class-transformer';

export class CreateFeedbackDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ example: 'Great service!' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ enum: FeedbackCategory, example: 'service' })
  @IsOptional()
  @IsEnum(FeedbackCategory)
  category?: FeedbackCategory;

  @ApiPropertyOptional({ example: 'New York, NY' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/image1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ type: [String], example: ['friendly', 'quick'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
