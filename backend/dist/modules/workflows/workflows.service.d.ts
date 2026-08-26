import { Model, Types } from 'mongoose';
import { Queue } from 'bullmq';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';
import { WorkflowVersion, WorkflowVersionDocument } from './schemas/workflow-version.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from './schemas/workflow-execution.schema';
import { CreateWorkflowDto, TriggerExecutionDto } from './dto/create-workflow.dto';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';
import { SubscriptionAccessService } from '../billing/services/subscription-access.service';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
export declare class WorkflowsService {
    private readonly workflowModel;
    private readonly versionModel;
    private readonly executionModel;
    private readonly executionQueue;
    private readonly workflowEngine;
    private readonly aiGateway;
    private readonly deadLetterService?;
    private readonly subscriptionAccess?;
    private readonly usageService?;
    private readonly logger;
    constructor(workflowModel: Model<WorkflowDocument>, versionModel: Model<WorkflowVersionDocument>, executionModel: Model<WorkflowExecutionDocument>, executionQueue: Queue, workflowEngine: WorkflowEngineService, aiGateway: AiGatewayService, deadLetterService?: DeadLetterQueueService, subscriptionAccess?: SubscriptionAccessService, usageService?: any);
    getDeadLetterQueueService(): DeadLetterQueueService | undefined;
    private toObjectId;
    create(organizationId: string, workspaceId: string, userId: string, dto: CreateWorkflowDto): Promise<WorkflowDocument>;
    list(organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, WorkflowDocument, {}, {}> & Workflow & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findById(workflowId: string, organizationId: string, workspaceId: string): Promise<WorkflowDocument>;
    update(workflowId: string, organizationId: string, workspaceId: string, updates: Partial<CreateWorkflowDto> & {
        status?: string;
    }): Promise<WorkflowDocument>;
    updateStatus(workflowId: string, organizationId: string, workspaceId: string, status: 'draft' | 'active' | 'paused' | 'disabled' | 'archived'): Promise<WorkflowDocument>;
    publish(workflowId: string, organizationId: string, workspaceId: string, userId: string, changelog?: string): Promise<WorkflowDocument>;
    listVersions(workflowId: string, organizationId: string, workspaceId: string): Promise<(import("mongoose").Document<unknown, {}, WorkflowVersionDocument, {}, {}> & WorkflowVersion & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    rollbackVersion(workflowId: string, versionNumber: number, organizationId: string, workspaceId: string, userId: string): Promise<WorkflowDocument>;
    duplicate(workflowId: string, organizationId: string, workspaceId: string, userId: string, newName?: string): Promise<WorkflowDocument>;
    triggerExecution(workflowId: string, organizationId: string, workspaceId: string, userId?: string, dto?: TriggerExecutionDto): Promise<WorkflowExecutionDocument>;
    triggerByWebhook(webhookId: string, payload: Record<string, any>): Promise<WorkflowExecutionDocument>;
    approveExecution(executionId: string, organizationId: string, workspaceId: string, userId: string, reason?: string): Promise<WorkflowExecutionDocument>;
    rejectExecution(executionId: string, organizationId: string, workspaceId: string, userId: string, reason?: string): Promise<WorkflowExecutionDocument>;
    listExecutions(organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, WorkflowExecutionDocument, {}, {}> & WorkflowExecution & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getExecutionById(executionId: string, organizationId: string, workspaceId: string): Promise<WorkflowExecutionDocument>;
    listDeadLetterQueue(organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, WorkflowExecutionDocument, {}, {}> & WorkflowExecution & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    retryDeadLetterJob(executionId: string, organizationId: string, workspaceId: string): Promise<WorkflowExecutionDocument>;
    cancelDeadLetterJob(executionId: string, organizationId: string, workspaceId: string): Promise<WorkflowExecutionDocument>;
    generateFromNaturalLanguage(organizationId: string, workspaceId: string, userId: string, prompt: string): Promise<WorkflowDocument>;
}
