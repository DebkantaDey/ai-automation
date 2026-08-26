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
  IsBoolean,
} from 'class-validator';
import { AppointmentStatus, AppointmentChannel } from '../schemas/appointment.schema';

export class CreateAppointmentDto {
  @ApiProperty({ example: 'Enterprise Architecture & AI Demo' })
  @IsString()
  @IsNotEmpty({ message: 'Appointment title is required' })
  title: string;

  @ApiPropertyOptional({ example: '30-minute demonstration of visual DAG workflows' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e101' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e102' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e103' })
  @IsOptional()
  @IsString()
  staffUserId?: string;

  @ApiProperty({ example: '2026-08-26T14:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiPropertyOptional({ example: 45 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'google_meet', enum: ['google_meet', 'zoom', 'in_person', 'phone'] })
  @IsOptional()
  @IsEnum(['google_meet', 'zoom', 'in_person', 'phone'])
  channel?: AppointmentChannel;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij' })
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isAiScheduled?: boolean;
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({ example: 'confirmed', enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] })
  @IsOptional()
  @IsEnum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'])
  status?: AppointmentStatus;

  @ApiPropertyOptional({ example: '2026-08-26T15:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ example: 'google_meet' })
  @IsOptional()
  @IsEnum(['google_meet', 'zoom', 'in_person', 'phone'])
  channel?: AppointmentChannel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  meetingUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SetAvailabilityDto {
  @ApiProperty({ example: 1, description: '0 for Sunday, 1 for Monday, etc.' })
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  slotDurationMinutes?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  bufferMinutes?: number;
}
