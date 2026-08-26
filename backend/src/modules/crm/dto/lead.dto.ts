import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
  IsObject,
} from 'class-validator';
import { LeadStatus, LeadPriority } from '../schemas/lead.schema';

export class CreateLeadDto {
  @ApiProperty({ example: 'David Vance' })
  @IsString()
  @IsNotEmpty({ message: 'Lead name is required' })
  name: string;

  @ApiPropertyOptional({ example: 'dvance@logistics-core.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ApiPropertyOptional({ example: '+1 (555) 234-5678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Global Logistics Corp' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'whatsapp', enum: ['website', 'whatsapp', 'email', 'manual', 'referral', 'api', 'phone', 'other'] })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'new', enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'] })
  @IsOptional()
  @IsEnum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'])
  status?: LeadStatus;

  @ApiPropertyOptional({ example: 'high', enum: ['low', 'medium', 'high'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: LeadPriority;

  @ApiPropertyOptional({ example: ['enterprise', 'high-intent'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Interested in automated appointment booking' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e101' })
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ example: { budget: 50000, companySize: 120 } })
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ example: 'David Vance' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'dvance@logistics-core.com' })
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

  @ApiPropertyOptional({ example: 'qualified' })
  @IsOptional()
  @IsEnum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'])
  status?: LeadStatus;

  @ApiPropertyOptional({ example: 'high' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: LeadPriority;

  @ApiPropertyOptional({ example: 92 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  leadScore?: number;

  @ApiPropertyOptional({ example: ['enterprise'] })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @ApiPropertyOptional({ example: 'Notes updated' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

export class ConvertLeadDto {
  @ApiPropertyOptional({ example: 'Enterprise Annual Subscription' })
  @IsOptional()
  @IsString()
  dealTitle?: string;

  @ApiPropertyOptional({ example: 48000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dealValue?: number;
}
