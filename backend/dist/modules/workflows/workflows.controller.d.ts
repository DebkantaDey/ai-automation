import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, TriggerExecutionDto } from './dto/create-workflow.dto';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class WorkflowsController {
    private readonly workflowsService;
    constructor(workflowsService: WorkflowsService);
    create(orgId: string, wsId: string, userId: string, dto: CreateWorkflowDto): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    generateFromPrompt(orgId: string, wsId: string, userId: string, prompt: string): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    list(orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/workflow.schema").WorkflowDocument, {}, {}> & import("./schemas/workflow.schema").Workflow & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listExecutions(orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/workflow-execution.schema").WorkflowExecutionDocument, {}, {}> & import("./schemas/workflow-execution.schema").WorkflowExecution & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listDeadLetterQueue(orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/workflow-execution.schema").WorkflowExecutionDocument, {}, {}> & import("./schemas/workflow-execution.schema").WorkflowExecution & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    retryDeadLetterJob(executionId: string, orgId: string, wsId: string): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    cancelDeadLetterJob(executionId: string, orgId: string, wsId: string): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    getExecutionById(executionId: string, orgId: string, wsId: string): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    approveExecution(executionId: string, orgId: string, wsId: string, userId: string, reason?: string): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    rejectExecution(executionId: string, orgId: string, wsId: string, userId: string, reason?: string): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    findById(id: string, orgId: string, wsId: string): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    update(id: string, orgId: string, wsId: string, updates: Partial<CreateWorkflowDto> & {
        status?: string;
    }): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    updateStatus(id: string, orgId: string, wsId: string, status: 'draft' | 'active' | 'paused' | 'disabled' | 'archived'): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    publish(id: string, orgId: string, wsId: string, userId: string, changelog?: string): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    listVersions(id: string, orgId: string, wsId: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/workflow-version.schema").WorkflowVersionDocument, {}, {}> & import("./schemas/workflow-version.schema").WorkflowVersion & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    rollbackVersion(id: string, version: string, orgId: string, wsId: string, userId: string): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    duplicate(id: string, orgId: string, wsId: string, userId: string, name?: string): Promise<import("./schemas/workflow.schema").WorkflowDocument>;
    execute(id: string, orgId: string, wsId: string, userId: string, dto: TriggerExecutionDto): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    triggerByWebhook(webhookId: string, payload: Record<string, any>): Promise<import("./schemas/workflow-execution.schema").WorkflowExecutionDocument>;
    listDeadLetterJobs(orgId: string, status?: string, workflowId?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/dead-letter-job.schema").DeadLetterJobDocument, {}, {}> & import("./schemas/dead-letter-job.schema").DeadLetterJob & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getDeadLetterJob(orgId: string, id: string): Promise<import("./schemas/dead-letter-job.schema").DeadLetterJobDocument>;
    replayDeadLetterJob(orgId: string, userId: string, id: string, customPayload?: Record<string, any>): Promise<import("./schemas/dead-letter-job.schema").DeadLetterJobDocument>;
    dismissDeadLetterJob(orgId: string, userId: string, id: string): Promise<import("./schemas/dead-letter-job.schema").DeadLetterJobDocument>;
}
