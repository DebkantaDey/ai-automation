import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Alex' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Morgan' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'alex@company.com' })
  @IsEmail({}, { message: 'Please provide a valid work email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^~_+=<>/-])[A-Za-z\d@$!%*?&#^~_+=<>/-]{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiProperty({ example: 'Secret123!' })
  @IsString()
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  @IsOptional()
  @IsString()
  organizationName?: string;
}
