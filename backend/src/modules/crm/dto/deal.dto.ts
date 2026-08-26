import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { DealStage } from '../schemas/deal.schema';

export class CreateDealDto {
  @ApiProperty({ example: 'Enterprise Omnichannel License' })
  @IsString()
  @IsNotEmpty({ message: 'Deal title is required' })
  title: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e101' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e102' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ example: 48000 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'proposal_sent', enum: ['discovery', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'] })
  @IsOptional()
  @IsEnum(['discovery', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'])
  stage?: DealStage;

  @ApiPropertyOptional({ example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional({ example: '2026-09-15' })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDealDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(['discovery', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'])
  stage?: DealStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
