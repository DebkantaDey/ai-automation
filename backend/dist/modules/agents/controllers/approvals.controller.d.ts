import { ApprovalsService } from '../services/approvals.service';
export declare class ApprovalsController {
    private readonly approvalsService;
    constructor(approvalsService: ApprovalsService);
    listApprovals(orgId: string, status?: string, actionType?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/approval-request.schema").ApprovalRequestDocument, {}, {}> & import("../schemas/approval-request.schema").ApprovalRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    getApprovalById(orgId: string, id: string): Promise<import("../schemas/approval-request.schema").ApprovalRequestDocument>;
    reviewApproval(orgId: string, userId: string, id: string, decision: 'approved' | 'rejected', notes?: string): Promise<import("../schemas/approval-request.schema").ApprovalRequestDocument>;
}
