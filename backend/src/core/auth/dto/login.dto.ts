import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'alex@company.com' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean = false;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
