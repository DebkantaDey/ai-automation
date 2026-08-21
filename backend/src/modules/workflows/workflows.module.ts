import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { WorkflowsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { WorkflowExecutionProcessor } from './processors/workflow-execution.processor';
import { Workflow, WorkflowSchema } from './schemas/workflow.schema';
import { WorkflowVersion, WorkflowVersionSchema } from './schemas/workflow-version.schema';
import { WorkflowExecution, WorkflowExecutionSchema } from './schemas/workflow-execution.schema';
import { QUEUE_WORKFLOW_EXECUTION } from '../../core/queue/queue.constants';
import { AiModule } from '../../integrations/ai/ai.module';
import { EventsModule } from '../../core/events/events.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workflow.name, schema: WorkflowSchema },
      { name: WorkflowVersion.name, schema: WorkflowVersionSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
    ]),
    BullModule.registerQueue({
      name: QUEUE_WORKFLOW_EXECUTION,
    }),
    AiModule,
    EventsModule,
    IntegrationsModule,
  ],
  controllers: [WorkflowsController],
  providers: [WorkflowsService, WorkflowEngineService, WorkflowExecutionProcessor],
  exports: [WorkflowsService, WorkflowEngineService, MongooseModule],
})
export class WorkflowsModule {}
