import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'Acme Technologies Global' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.company.com/logo-new.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://cdn.company.com/logo-new.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Updated organization description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Financial Services' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: 'https://acmeglobal.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'Europe/London' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'GB' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'GBP' })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'suspended', 'trial', 'cancelled'] })
  @IsOptional()
  @IsEnum(['active', 'suspended', 'trial', 'cancelled'], {
    message: 'Status must be one of: active, suspended, trial, cancelled',
  })
  status?: 'active' | 'suspended' | 'trial' | 'cancelled';
}
