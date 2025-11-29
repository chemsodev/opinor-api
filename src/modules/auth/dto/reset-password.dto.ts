import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'The reset token from email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewStrongP@ssw0rd' })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
