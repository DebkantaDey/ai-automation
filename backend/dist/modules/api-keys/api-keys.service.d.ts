import { Model, Types } from 'mongoose';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
export interface CreateApiKeyDto {
    name: string;
    scopes?: string[];
    expiresInDays?: number;
}
export declare class ApiKeysService {
    private readonly apiKeyModel;
    private readonly auditLogsService?;
    private readonly logger;
    constructor(apiKeyModel: Model<ApiKeyDocument>, auditLogsService?: AuditLogsService);
    private toObjectId;
    private hashKey;
    createApiKey(organizationId: string, workspaceId: string, userId: string, dto: CreateApiKeyDto): Promise<{
        apiKey: ApiKeyDocument;
        secretKey: string;
    }>;
    listApiKeys(organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, ApiKeyDocument, {}, {}> & ApiKey & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    revokeApiKey(id: string, organizationId: string, workspaceId: string, userId: string): Promise<ApiKeyDocument>;
    validateKey(rawKey: string): Promise<ApiKeyDocument>;
}
