import { KnowledgeBaseService, CreateKnowledgeBaseDto, AddDocumentDto } from './knowledge-base.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class KnowledgeBaseController {
    private readonly kbService;
    constructor(kbService: KnowledgeBaseService);
    create(orgId: string, wsId: string, userId: string, dto: CreateKnowledgeBaseDto): Promise<import("./schemas/knowledge-base.schema").KnowledgeBaseDocument>;
    list(orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/knowledge-base.schema").KnowledgeBaseDocument, {}, {}> & import("./schemas/knowledge-base.schema").KnowledgeBase & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getById(id: string, orgId: string, wsId: string): Promise<import("./schemas/knowledge-base.schema").KnowledgeBaseDocument>;
    addDocument(id: string, orgId: string, wsId: string, userId: string, dto: AddDocumentDto): Promise<import("./schemas/document.schema").DocumentDocument>;
    listDocuments(id: string, orgId: string, wsId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/document.schema").DocumentDocument, {}, {}> & import("./schemas/document.schema").Document & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    askQuestion(id: string, orgId: string, wsId: string, question: string): Promise<{
        answer: string;
        sources: {
            text: string;
            score: number;
            metadata: any;
        }[];
        usage: import("../../integrations/ai/ai.interface").AiUsage;
    }>;
}
