import { Model, Types } from 'mongoose';
import { Queue } from 'bullmq';
import { KnowledgeBase, KnowledgeBaseDocument } from './schemas/knowledge-base.schema';
import { Document, DocumentDocument } from './schemas/document.schema';
import { DocumentChunkDocument } from './schemas/document-chunk.schema';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
import { UsageService } from '../billing/services/usage.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export interface CreateKnowledgeBaseDto {
    name: string;
    description?: string;
}
export interface AddDocumentDto {
    name: string;
    rawText: string;
    mimeType?: string;
}
export declare class KnowledgeBaseService {
    private readonly kbModel;
    private readonly documentModel;
    private readonly chunkModel;
    private readonly fileProcessingQueue;
    private readonly aiGateway;
    private readonly usageService?;
    private readonly logger;
    constructor(kbModel: Model<KnowledgeBaseDocument>, documentModel: Model<DocumentDocument>, chunkModel: Model<DocumentChunkDocument>, fileProcessingQueue: Queue, aiGateway: AiGatewayService, usageService?: UsageService);
    private toObjectId;
    createKnowledgeBase(organizationId: string, workspaceId: string, userId: string, dto: CreateKnowledgeBaseDto): Promise<KnowledgeBaseDocument>;
    listKnowledgeBases(organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, KnowledgeBaseDocument, {}, {}> & KnowledgeBase & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getKnowledgeBaseById(id: string, organizationId: string, workspaceId: string): Promise<KnowledgeBaseDocument>;
    addDocument(knowledgeBaseId: string, organizationId: string, workspaceId: string, userId: string, dto: AddDocumentDto): Promise<DocumentDocument>;
    listDocuments(knowledgeBaseId: string, organizationId: string, workspaceId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, DocumentDocument, {}, {}> & Document & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    private cosineSimilarity;
    vectorSearch(knowledgeBaseId: string, organizationId: string, workspaceId: string, queryText: string, topK?: number): Promise<Array<{
        chunkId: string;
        text: string;
        score: number;
        metadata: any;
    }>>;
    askQuestion(knowledgeBaseId: string, organizationId: string, workspaceId: string, question: string): Promise<{
        answer: string;
        sources: {
            text: string;
            score: number;
            metadata: any;
        }[];
        usage: import("../../integrations/ai/ai.interface").AiUsage;
    }>;
}
