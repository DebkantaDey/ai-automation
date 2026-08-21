import { Model, Connection } from 'mongoose';
import { UserDocument } from '../users/schemas/user.schema';
import { Organization, OrganizationDocument } from '../organizations/schemas/organization.schema';
import { SubscriptionDocument } from '../billing/schemas/subscription.schema';
import { WorkflowDocument } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from '../workflows/schemas/workflow-execution.schema';
import { AuditLog, AuditLogDocument } from '../audit-logs/schemas/audit-log.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class AdminService {
    private readonly mongoConnection;
    private readonly userModel;
    private readonly orgModel;
    private readonly subscriptionModel;
    private readonly workflowModel;
    private readonly executionModel;
    private readonly auditLogModel;
    private readonly logger;
    constructor(mongoConnection: Connection, userModel: Model<UserDocument>, orgModel: Model<OrganizationDocument>, subscriptionModel: Model<SubscriptionDocument>, workflowModel: Model<WorkflowDocument>, executionModel: Model<WorkflowExecutionDocument>, auditLogModel: Model<AuditLogDocument>);
    getPlatformOverview(): Promise<{
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
    getSystemHealth(): Promise<{
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
        data: (import("mongoose").Document<unknown, {}, OrganizationDocument, {}, {}> & Organization & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
        data: (import("mongoose").Document<unknown, {}, AuditLogDocument, {}, {}> & AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    listGlobalDeadLetterQueue(pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, WorkflowExecutionDocument, {}, {}> & WorkflowExecution & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
