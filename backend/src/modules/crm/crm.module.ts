import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './schemas/lead.schema';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Deal, DealSchema } from './schemas/deal.schema';
import { CustomerActivity, CustomerActivitySchema } from './schemas/customer-activity.schema';
import { LeadsService } from './services/leads.service';
import { CustomersService } from './services/customers.service';
import { DealsService } from './services/deals.service';
import { LeadScoringService } from './services/lead-scoring.service';
import { LeadsController } from './controllers/leads.controller';
import { CustomersController } from './controllers/customers.controller';
import { DealsController } from './controllers/deals.controller';
import { AiModule } from '../../integrations/ai/ai.module';
import { EventsModule } from '../../core/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Deal.name, schema: DealSchema },
      { name: CustomerActivity.name, schema: CustomerActivitySchema },
    ]),
    AiModule,
    EventsModule,
  ],
  controllers: [LeadsController, CustomersController, DealsController],
  providers: [LeadsService, CustomersService, DealsService, LeadScoringService],
  exports: [LeadsService, CustomersService, DealsService, LeadScoringService],
})
export class CrmModule {}
