import { Model, Types } from 'mongoose';
import { ApprovalRequest, ApprovalRequestDocument } from '../schemas/approval-request.schema';
import { EventBusService } from '../../../core/events/event-bus.service';
export interface CreateApprovalDto {
    actionType: 'issue_refund' | 'send_mass_whatsapp' | 'apply_discount' | 'delete_record' | 'custom';
    title: string;
    reason: string;
    payload: Record<string, any>;
    agentId?: string;
    executionId?: string;
    requestedByAgentName?: string;
}
export declare class ApprovalsService {
    private readonly approvalModel;
    private readonly eventBus;
    private readonly logger;
    constructor(approvalModel: Model<ApprovalRequestDocument>, eventBus: EventBusService);
    private toObjectId;
    createApproval(organizationId: string, dto: CreateApprovalDto, workspaceId?: string): Promise<ApprovalRequestDocument>;
    listApprovals(organizationId: string, query?: {
        status?: string;
        actionType?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, ApprovalRequestDocument, {}, {}> & ApprovalRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    getApprovalById(organizationId: string, id: string): Promise<ApprovalRequestDocument>;
    reviewApproval(organizationId: string, id: string, userId: string, decision: 'approved' | 'rejected', reviewNotes?: string): Promise<ApprovalRequestDocument>;
}
