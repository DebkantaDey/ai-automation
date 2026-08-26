import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invoice, InvoiceSchema } from './schemas/invoice.schema';
import { PaymentLedger, PaymentLedgerSchema } from './schemas/payment-ledger.schema';
import { Customer, CustomerSchema } from '../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivitySchema } from '../crm/schemas/customer-activity.schema';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';
import { EventsModule } from '../../core/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: PaymentLedger.name, schema: PaymentLedgerSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerActivity.name, schema: CustomerActivitySchema },
    ]),
    EventsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
