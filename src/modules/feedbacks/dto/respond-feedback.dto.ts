import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RespondToFeedbackDto {
  @ApiProperty({
    description: 'Response text',
    example: 'Thank you for your feedback! We appreciate your kind words.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  text: string;
}
