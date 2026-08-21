import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export interface RecordAuditParams {
    organizationId: string;
    workspaceId?: string;
    userId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    changes?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditLogsService {
    private readonly auditLogModel;
    private readonly logger;
    constructor(auditLogModel: Model<AuditLogDocument>);
    log(params: RecordAuditParams): Promise<void>;
    list(organizationId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, AuditLogDocument, {}, {}> & AuditLog & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
