import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationRole } from '../../../core/common/enums/role.enum';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Acme Technologies' })
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'acme-technologies' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'https://cdn.company.com/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://cdn.company.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'Enterprise AI automation solutions provider' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: 'https://acme.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ example: 'America/New_York', default: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: 'US', default: 'US' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  defaultCurrency?: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'colleague@company.com' })
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'member', enum: OrganizationRole, default: OrganizationRole.MEMBER })
  @IsOptional()
  role?: OrganizationRole = OrganizationRole.MEMBER;
}
