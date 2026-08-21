import { Model } from 'mongoose';
import { WorkflowExecutionDocument, AIUsageStats } from '../schemas/workflow-execution.schema';
import { WorkflowNode, WorkflowEdge } from '../schemas/workflow.schema';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
import { IntegrationsService } from '../../integrations/integrations.service';
import { EventBusService } from '../../../core/events/event-bus.service';
export interface ExecutionContext {
    trigger: Record<string, any>;
    steps: Record<string, {
        status: string;
        input?: any;
        output?: any;
        error?: string;
    }>;
    env: Record<string, any>;
    item?: any;
    index?: number;
    total?: number;
}
export interface ConditionRule {
    field: string;
    operator: string;
    value: any;
}
export declare class WorkflowEngineService {
    private readonly executionModel;
    private readonly aiGateway;
    private readonly integrationsService?;
    private readonly eventBus?;
    private readonly logger;
    constructor(executionModel: Model<WorkflowExecutionDocument>, aiGateway: AiGatewayService, integrationsService?: IntegrationsService, eventBus?: EventBusService);
    private toObjectId;
    interpolate(value: any, context: ExecutionContext): any;
    getExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[];
    evaluateCondition(left: any, operator: string, right: any): boolean;
    executeNode(node: WorkflowNode, context: ExecutionContext, aiUsage: AIUsageStats): Promise<{
        output: any;
        status: 'completed' | 'waiting_approval' | 'skipped';
        tokenDetails?: ApprovalDetailsPayload;
    }>;
    runWorkflow(executionId: string, nodes: WorkflowNode[], edges: WorkflowEdge[], initialPayload?: Record<string, any>, resumeFromNodeId?: string): Promise<WorkflowExecutionDocument>;
    approveExecution(executionId: string, actorUserId: string, reason?: string): Promise<WorkflowExecutionDocument>;
    rejectExecution(executionId: string, actorUserId: string, reason?: string): Promise<WorkflowExecutionDocument>;
}
interface ApprovalDetailsPayload {
    approvalToken: string;
    requiredRole: string;
    nodeId: string;
}
export {};
