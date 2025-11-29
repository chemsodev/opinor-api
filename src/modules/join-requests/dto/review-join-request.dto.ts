import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JoinRequestStatus } from '../../../database/entities';

export class ReviewJoinRequestDto {
  @ApiProperty({ enum: JoinRequestStatus, example: JoinRequestStatus.APPROVED })
  @IsEnum(JoinRequestStatus)
  status: JoinRequestStatus;

  @ApiPropertyOptional({ description: 'Reason for rejection (if rejected)' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
