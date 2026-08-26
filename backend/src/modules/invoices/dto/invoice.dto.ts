import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus, PaymentProvider } from '../schemas/invoice.schema';

export class InvoiceLineItemDto {
  @ApiProperty({ example: 'Enterprise Monthly Orchestration Plan' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 4800 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 4800 })
  @IsNumber()
  @Min(0)
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: '60d5ecb8b392d721b8f1e101' })
  @IsString()
  @IsNotEmpty({ message: 'customerId is required' })
  customerId: string;

  @ApiPropertyOptional({ example: '60d5ecb8b392d721b8f1e102' })
  @IsOptional()
  @IsString()
  leadId?: string;

  @ApiProperty({ type: [InvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  items: InvoiceLineItemDto[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '2026-09-15T23:59:59.000Z' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiPropertyOptional({ example: 'stripe', enum: ['stripe', 'razorpay', 'manual', 'wire'] })
  @IsOptional()
  @IsEnum(['stripe', 'razorpay', 'manual', 'wire'])
  paymentProvider?: PaymentProvider;

  @ApiPropertyOptional({ example: 'Payment due within 30 days of invoice receipt.' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional({ example: 'sent', enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'] })
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'])
  status?: InvoiceStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  paymentReference?: string;
}

export class MarkPaidDto {
  @ApiPropertyOptional({ example: 'stripe', enum: ['stripe', 'razorpay', 'manual', 'wire'] })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ example: 'ch_3Nabc123456789' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
