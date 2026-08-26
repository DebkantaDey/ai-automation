import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import { AgentToolsRegistry } from '../tools/agent-tools.registry';
import { ApprovalsService } from '../services/approvals.service';
import { AgentDocument } from '../schemas/agent.schema';
import { AgentExecutionDocument } from '../schemas/agent-execution.schema';
export declare class AgentEngineService {
    private readonly aiGateway;
    private readonly integrationsService?;
    private readonly toolsRegistry?;
    private readonly approvalsService?;
    private readonly logger;
    constructor(aiGateway: AiGatewayService, integrationsService?: IntegrationsService, toolsRegistry?: AgentToolsRegistry, approvalsService?: ApprovalsService);
    runAgentLoop(agent: AgentDocument, execution: AgentExecutionDocument): Promise<AgentExecutionDocument>;
    private executeFallbackTool;
}
