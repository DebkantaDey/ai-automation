import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';

export class CreateTaskDto {
  @ApiProperty({ example: 'Prepare Custom Proposal Document for Global Logistics' })
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  title: string;

  @ApiPropertyOptional({ example: 'Draft tailored pricing tiers based on 50 seat volume' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e101' })
  @IsOptional()
  @IsString()
  assigneeUserId?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e102' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e103' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ example: 'high', enum: ['low', 'medium', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 'todo', enum: ['todo', 'in_progress', 'completed', 'cancelled'] })
  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'completed', 'cancelled'])
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2026-08-28T18:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAiGenerated?: boolean;

  @ApiPropertyOptional({ example: 'Workflow: Inbound Lead Qualification' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: ['sales', 'proposal'] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assigneeUserId?: string;

  @ApiPropertyOptional({ example: 'in_progress' })
  @IsOptional()
  @IsEnum(['todo', 'in_progress', 'completed', 'cancelled'])
  status?: TaskStatus;

  @ApiPropertyOptional({ example: 'urgent' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: TaskPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
