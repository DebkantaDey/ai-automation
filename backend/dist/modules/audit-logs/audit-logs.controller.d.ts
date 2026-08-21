import { AuditLogsService } from './audit-logs.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class AuditLogsController {
    private readonly auditLogsService;
    constructor(auditLogsService: AuditLogsService);
    list(orgId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/audit-log.schema").AuditLogDocument, {}, {}> & import("./schemas/audit-log.schema").AuditLog & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
