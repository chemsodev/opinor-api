import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyFeedbackDto {
  @ApiProperty({
    description: 'Admin reply to the feedback',
    example: 'Thank you for your feedback. We are taking measures to improve.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reply: string;
}
