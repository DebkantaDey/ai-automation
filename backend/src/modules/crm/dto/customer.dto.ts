import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  IsObject,
} from 'class-validator';
import { CustomerStatus, CustomerTier } from '../schemas/customer.schema';
import { ActivityType } from '../schemas/customer-activity.schema';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Sarah Jenkins' })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  name: string;

  @ApiPropertyOptional({ example: 'sjenkins@globallogistics.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+1 (555) 234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Global Logistics Corp' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'churned', 'inactive', 'onboarding'] })
  @IsOptional()
  @IsEnum(['active', 'churned', 'inactive', 'onboarding'])
  status?: CustomerStatus;

  @ApiPropertyOptional({ example: 'enterprise', enum: ['starter', 'pro', 'enterprise', 'custom'] })
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise', 'custom'])
  tier?: CustomerTier;

  @ApiPropertyOptional({ example: 48000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpend?: number;

  @ApiPropertyOptional({ example: ['vip', 'enterprise'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Key customer on dedicated account management' })
  @IsOptional()
  @IsString()
  aiInsights?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['active', 'churned', 'inactive', 'onboarding'])
  status?: CustomerStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise', 'custom'])
  tier?: CustomerTier;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalSpend?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aiInsights?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  churnRisk?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;
}

export class AddCustomerActivityDto {
  @ApiProperty({ example: 'note', enum: ['message', 'invoice', 'appointment', 'task', 'ai_interaction', 'note', 'stage_change', 'call', 'email'] })
  @IsEnum(['message', 'invoice', 'appointment', 'task', 'ai_interaction', 'note', 'stage_change', 'call', 'email'])
  activityType: ActivityType;

  @ApiProperty({ example: 'Call with Executive Sponsor' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Discussed renewal options and expanding to WhatsApp customer support.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: 'human', enum: ['human', 'ai', 'system'] })
  @IsOptional()
  @IsString()
  source?: string;
}
