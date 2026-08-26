import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';
import { ChannelType, ConversationStatus } from '../schemas/conversation.schema';

export class SendMessageDto {
  @ApiProperty({ example: 'Hello! Thanks for reaching out. We would love to schedule your demo.' })
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  content: string;

  @ApiPropertyOptional({ example: 'whatsapp', enum: ['whatsapp', 'email', 'webchat', 'sms'] })
  @IsOptional()
  @IsEnum(['whatsapp', 'email', 'webchat', 'sms'])
  channel?: ChannelType;

  @ApiPropertyOptional({ example: [{ type: 'image', url: 'https://cdn.domain.com/doc.pdf', name: 'Proposal.pdf' }] })
  @IsOptional()
  @IsArray()
  attachments?: Array<{ type: string; url: string; name?: string; size?: number }>;
}

export class ToggleAiTakeoverDto {
  @ApiProperty({ example: true, description: 'True to let AI handle, False for human takeover' })
  @IsBoolean()
  isAiHandled: boolean;

  @ApiPropertyOptional({ example: 'Staff agent took over to handle custom price negotiation' })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateConversationDto {
  @ApiPropertyOptional({ example: 'closed', enum: ['open', 'closed', 'snoozed'] })
  @IsOptional()
  @IsEnum(['open', 'closed', 'snoozed'])
  status?: ConversationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @ApiPropertyOptional({ example: ['vip', 'demo-requested'] })
  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class InboundMessagePayloadDto {
  @ApiProperty({ example: 'whatsapp' })
  @IsEnum(['whatsapp', 'email', 'webchat', 'sms'])
  channel: ChannelType;

  @ApiProperty({ example: '+1 (555) 234-5678' })
  @IsString()
  @IsNotEmpty()
  senderIdentifier: string;

  @ApiProperty({ example: 'David Vance' })
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @ApiProperty({ example: 'Can we schedule a 30-min demo for tomorrow at 2:00 PM?' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'wamid.HBgLMjM0...' })
  @IsOptional()
  @IsString()
  externalMessageId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, any>;
}
