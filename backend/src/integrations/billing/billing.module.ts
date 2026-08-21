import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeBillingProvider } from './providers/stripe.provider';
import { RazorpayBillingProvider } from './providers/razorpay.provider';
import { BillingService } from './billing.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [StripeBillingProvider, RazorpayBillingProvider, BillingService],
  exports: [BillingService],
})
export class BillingModule {}
