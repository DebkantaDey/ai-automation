import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import { AgentDocument } from '../schemas/agent.schema';
import { AgentExecutionDocument } from '../schemas/agent-execution.schema';
export declare class AgentEngineService {
    private readonly aiGateway;
    private readonly integrationsService?;
    private readonly logger;
    constructor(aiGateway: AiGatewayService, integrationsService?: IntegrationsService);
    runAgentLoop(agent: AgentDocument, execution: AgentExecutionDocument): Promise<AgentExecutionDocument>;
    private executeAgentTool;
}
