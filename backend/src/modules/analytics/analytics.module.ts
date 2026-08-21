import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Workflow, WorkflowSchema } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionSchema } from '../workflows/schemas/workflow-execution.schema';
import { UsageRecord, UsageRecordSchema } from '../billing/schemas/usage-record.schema';
import { BillingModule } from '../billing/billing.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workflow.name, schema: WorkflowSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
      { name: UsageRecord.name, schema: UsageRecordSchema },
    ]),
    BillingModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
