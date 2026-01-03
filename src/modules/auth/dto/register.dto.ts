import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../common/decorators';

export class RegisterDto {
  @ApiProperty({
    description: 'The 6-digit invitation code from approved join request',
    example: '123456',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Password (min 8 characters)',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'Password confirmation (must match password)',
    example: 'StrongP@ssw0rd',
  })
  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirmation: string;
}
