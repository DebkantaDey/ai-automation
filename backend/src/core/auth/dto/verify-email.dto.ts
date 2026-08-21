import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ example: 'a9f24e...' })
  @IsString()
  @IsNotEmpty({ message: 'Verification token is required' })
  token: string;

  @ApiProperty({ example: 'alex@company.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'alex@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;
}
