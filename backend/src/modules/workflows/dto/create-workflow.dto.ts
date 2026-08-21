import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Customer Onboarding Pipeline' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Automates customer welcome emails and CRM enrichment' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['manual', 'webhook', 'schedule', 'app_event'], default: 'manual' })
  @IsOptional()
  @IsString()
  triggerType?: string = 'manual';

  @ApiPropertyOptional()
  @IsOptional()
  triggerConfig?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  nodes?: Array<any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  edges?: Array<any>;

  @ApiPropertyOptional()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'paused', 'disabled', 'archived'] })
  @IsOptional()
  @IsString()
  status?: string;
}

export class TriggerExecutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  payload?: Record<string, any>;
}
