import { ApiKeysService, CreateApiKeyDto } from './api-keys.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class ApiKeysController {
    private readonly apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    create(orgId: string, wsId: string, userId: string, dto: CreateApiKeyDto): Promise<{
        apiKey: import("./schemas/api-key.schema").ApiKeyDocument;
        secretKey: string;
    }>;
    list(orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/api-key.schema").ApiKeyDocument, {}, {}> & import("./schemas/api-key.schema").ApiKey & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    revoke(id: string, orgId: string, wsId: string, userId: string): Promise<import("./schemas/api-key.schema").ApiKeyDocument>;
}
