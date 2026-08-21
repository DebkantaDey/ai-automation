import { AdminService } from './admin.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getOverview(): Promise<{
        users: {
            total: number;
        };
        organizations: {
            total: number;
        };
        subscriptions: {
            active: number;
            trialing: number;
            total: number;
        };
        workflows: {
            total: number;
        };
        executions: {
            total: number;
            failed: number;
            successRate: number;
        };
    }>;
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        components: {
            api: {
                status: string;
                version: string;
            };
            database: {
                status: string;
                latencyMs: number;
                engine: string;
            };
            redis: {
                status: string;
                ping: string;
            };
            queues: {
                status: string;
                activeWorkers: number;
                failedJobsDlq: number;
            };
            aiGateway: {
                status: string;
                providers: string[];
            };
            paymentGateways: {
                stripe: {
                    status: string;
                };
                razorpay: {
                    status: string;
                };
            };
        };
    }>;
    listOrganizations(pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../organizations/schemas/organization.schema").OrganizationDocument, {}, {}> & import("../organizations/schemas/organization.schema").Organization & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listGlobalAuditLogs(pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../audit-logs/schemas/audit-log.schema").AuditLogDocument, {}, {}> & import("../audit-logs/schemas/audit-log.schema").AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listGlobalDlq(pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../workflows/schemas/workflow-execution.schema").WorkflowExecutionDocument, {}, {}> & import("../workflows/schemas/workflow-execution.schema").WorkflowExecution & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
