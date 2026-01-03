import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JoinRequestStatus } from '../../../database/entities';

export class ReviewJoinRequestDto {
  @ApiProperty({
    enum: [JoinRequestStatus.APPROVED, JoinRequestStatus.REJECTED],
    example: JoinRequestStatus.APPROVED,
    description:
      'New status for the join request. Use APPROVED to send invitation code, REJECTED to decline.',
  })
  @IsEnum(JoinRequestStatus)
  status: JoinRequestStatus;

  @ApiPropertyOptional({
    example: 'Business does not meet our requirements',
    description:
      'Reason for rejection. Required when status is REJECTED. Stored for admin reference.',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}
