import { IsOptional, IsInt, Min, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FeedbackQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by rating (1-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  rating?: number;

  @ApiPropertyOptional({
    description: 'Filter by sentiment',
    enum: ['positive', 'negative', 'neutral'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['positive', 'negative', 'neutral'])
  sentiment?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['new', 'viewed', 'responded', 'archived'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['new', 'viewed', 'responded', 'archived'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;
}
