import { Model, Types } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { AgentExecution, AgentExecutionDocument } from './schemas/agent-execution.schema';
import { AgentEngineService } from './engine/agent-engine.service';
import { UsageService } from '../billing/services/usage.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export interface CreateAgentDto {
    name: string;
    description?: string;
    instructions: string;
    provider?: string;
    model?: string;
    tools?: any[];
    knowledgeSources?: string[];
    limits?: {
        maxSteps?: number;
        maxTokens?: number;
        maxToolCalls?: number;
        timeoutSeconds?: number;
    };
}
export declare class AgentsService {
    private readonly agentModel;
    private readonly executionModel;
    private readonly agentEngine;
    private readonly usageService?;
    private readonly logger;
    constructor(agentModel: Model<AgentDocument>, executionModel: Model<AgentExecutionDocument>, agentEngine: AgentEngineService, usageService?: UsageService);
    private toObjectId;
    createAgent(organizationId: string, workspaceId: string, userId: string, dto: CreateAgentDto): Promise<AgentDocument>;
    listAgents(organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, AgentDocument, {}, {}> & Agent & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAgentById(id: string, organizationId: string, workspaceId: string): Promise<AgentDocument>;
    updateAgent(id: string, organizationId: string, workspaceId: string, updates: Partial<CreateAgentDto> & {
        status?: string;
    }): Promise<AgentDocument>;
    deleteAgent(id: string, organizationId: string, workspaceId: string): Promise<void>;
    runAgent(agentId: string, organizationId: string, workspaceId: string, userId: string, inputPrompt: string): Promise<AgentExecutionDocument>;
    listExecutions(agentId: string, organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, AgentExecutionDocument, {}, {}> & AgentExecution & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
