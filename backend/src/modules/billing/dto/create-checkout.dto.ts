import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckoutDto {
  @ApiProperty({ example: 'starter', description: 'Plan slug (e.g. starter, business, enterprise)' })
  @IsString()
  @IsNotEmpty({ message: 'Plan slug is required' })
  planSlug: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
  @IsString()
  @IsIn(['monthly', 'yearly'], { message: 'Billing interval must be either monthly or yearly' })
  billingInterval: 'monthly' | 'yearly';

  @ApiPropertyOptional({ example: 'stripe', enum: ['stripe', 'razorpay'] })
  @IsOptional()
  @IsString()
  provider?: 'stripe' | 'razorpay';

  @ApiPropertyOptional({ example: 'http://localhost:3000/settings/billing?success=true' })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({ example: 'http://localhost:3000/settings/billing?cancelled=true' })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}

export class ChangePlanDto {
  @ApiProperty({ example: 'business', description: 'Target plan slug' })
  @IsString()
  @IsNotEmpty({ message: 'Plan slug is required' })
  planSlug: string;

  @ApiProperty({ example: 'monthly', enum: ['monthly', 'yearly'] })
  @IsString()
  @IsIn(['monthly', 'yearly'])
  billingInterval: 'monthly' | 'yearly';
}
