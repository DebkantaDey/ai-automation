import { AgentsService, CreateAgentDto } from './agents.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class AgentsController {
    private readonly agentsService;
    constructor(agentsService: AgentsService);
    create(orgId: string, wsId: string, userId: string, dto: CreateAgentDto): Promise<import("./schemas/agent.schema").AgentDocument>;
    list(orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/agent.schema").AgentDocument, {}, {}> & import("./schemas/agent.schema").Agent & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(id: string, orgId: string, wsId: string): Promise<import("./schemas/agent.schema").AgentDocument>;
    update(id: string, orgId: string, wsId: string, updates: Partial<CreateAgentDto> & {
        status?: string;
    }): Promise<import("./schemas/agent.schema").AgentDocument>;
    delete(id: string, orgId: string, wsId: string): Promise<{
        success: boolean;
    }>;
    runAgent(id: string, orgId: string, wsId: string, userId: string, inputPrompt: string): Promise<import("./schemas/agent-execution.schema").AgentExecutionDocument>;
    listExecutions(id: string, orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/agent-execution.schema").AgentExecutionDocument, {}, {}> & import("./schemas/agent-execution.schema").AgentExecution & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
