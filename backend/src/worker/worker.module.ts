import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigurations } from '../core/config';
import { DatabaseModule } from '../core/database/database.module';
import { TenancyModule } from '../core/tenancy/tenancy.module';
import { QueueModule } from '../core/queue/queue.module';
import { AiModule } from '../integrations/ai/ai.module';
import { StorageModule } from '../integrations/storage/storage.module';
import { BillingModule } from '../integrations/billing/billing.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WorkflowExecution,
  WorkflowExecutionSchema,
} from '../modules/workflows/schemas/workflow-execution.schema';
import {
  Workflow,
  WorkflowSchema,
} from '../modules/workflows/schemas/workflow.schema';
import { WorkflowExecutionProcessor } from './processors/workflow-execution.processor';
import { AiTaskProcessor } from './processors/ai-task.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: appConfigurations,
      envFilePath: ['.env.local', '.env'],
    }),
    DatabaseModule,
    TenancyModule,
    QueueModule,
    AiModule,
    StorageModule,
    BillingModule,
    MongooseModule.forFeature([
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
      { name: Workflow.name, schema: WorkflowSchema },
    ]),
  ],
  providers: [WorkflowExecutionProcessor, AiTaskProcessor],
})
export class WorkerModule {}
