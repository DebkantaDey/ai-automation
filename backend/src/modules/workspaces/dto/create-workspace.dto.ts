import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Marketing Automation' })
  @IsString()
  @IsNotEmpty({ message: 'Workspace name is required' })
  @MaxLength(60)
  name: string;

  @ApiPropertyOptional({ example: 'marketing-automation' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Workflows and integrations for marketing team' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'Megaphone' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'UTC' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ example: { aiModelDefault: 'gpt-4o' } })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: 'Marketing Automation' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated workspace description' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'Layers' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ enum: ['active', 'archived', 'suspended'] })
  @IsOptional()
  @IsIn(['active', 'archived', 'suspended'])
  status?: 'active' | 'archived' | 'suspended';

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
