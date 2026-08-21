import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentEngineService } from './engine/agent-engine.service';
import { Agent, AgentSchema } from './schemas/agent.schema';
import { AgentExecution, AgentExecutionSchema } from './schemas/agent-execution.schema';
import { AiModule } from '../../integrations/ai/ai.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agent.name, schema: AgentSchema },
      { name: AgentExecution.name, schema: AgentExecutionSchema },
    ]),
    AiModule,
    IntegrationsModule,
  ],
  controllers: [AgentsController],
  providers: [AgentsService, AgentEngineService],
  exports: [AgentsService, AgentEngineService, MongooseModule],
})
export class AgentsModule {}
