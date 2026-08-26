import { Module, Global, forwardRef } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { WorkflowsModule } from '../workflows/workflows.module';
import { AgentsModule } from '../agents/agents.module';
import { CrmModule } from '../crm/crm.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { EventsModule } from '../../core/events/events.module';

@Global()
@Module({
  imports: [
    WorkflowsModule,
    forwardRef(() => AgentsModule),
    forwardRef(() => CrmModule),
    forwardRef(() => InvoicesModule),
    EventsModule,
  ],
  controllers: [TemplatesController],
  providers: [TemplatesService],
  exports: [TemplatesService],
})
export class TemplatesModule {}
