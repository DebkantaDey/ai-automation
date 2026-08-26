import { Module, Global, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsController } from './agents.controller';
import { ApprovalsController } from './controllers/approvals.controller';
import { AgentsService } from './agents.service';
import { AgentEngineService } from './engine/agent-engine.service';
import { ApprovalsService } from './services/approvals.service';
import { AgentToolsRegistry } from './tools/agent-tools.registry';
import { Agent, AgentSchema } from './schemas/agent.schema';
import { AgentExecution, AgentExecutionSchema } from './schemas/agent-execution.schema';
import { ApprovalRequest, ApprovalRequestSchema } from './schemas/approval-request.schema';
import { AiModule } from '../../integrations/ai/ai.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { EventsModule } from '../../core/events/events.module';
import { CrmModule } from '../crm/crm.module';
import { CalendarModule } from '../calendar/calendar.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { TasksModule } from '../tasks/tasks.module';
import { InboxModule } from '../inbox/inbox.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: AgentExecution.name, schema: AgentExecutionSchema },
      { name: ApprovalRequest.name, schema: ApprovalRequestSchema },
    ]),
    AiModule,
    IntegrationsModule,
    EventsModule,
    forwardRef(() => CrmModule),
    forwardRef(() => CalendarModule),
    forwardRef(() => InvoicesModule),
    forwardRef(() => TasksModule),
    forwardRef(() => InboxModule),
  ],
  controllers: [AgentsController, ApprovalsController],
  providers: [
    AgentsService,
    AgentEngineService,
    ApprovalsService,
    AgentToolsRegistry,
  ],
  exports: [
    AgentsService,
    AgentEngineService,
    ApprovalsService,
    AgentToolsRegistry,
    MongooseModule,
  ],
})
export class AgentsModule {}
