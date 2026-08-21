import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { DocumentDocument } from '../schemas/document.schema';
import { DocumentChunkDocument } from '../schemas/document-chunk.schema';
import { KnowledgeBaseDocument } from '../schemas/knowledge-base.schema';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';
export interface FileProcessingJobData {
    documentId: string;
    knowledgeBaseId: string;
    organizationId: string;
    workspaceId: string;
    rawText: string;
    name: string;
}
export declare class FileProcessingProcessor extends WorkerHost {
    private readonly documentModel;
    private readonly chunkModel;
    private readonly kbModel;
    private readonly aiGateway;
    private readonly logger;
    constructor(documentModel: Model<DocumentDocument>, chunkModel: Model<DocumentChunkDocument>, kbModel: Model<KnowledgeBaseDocument>, aiGateway: AiGatewayService);
    private splitIntoChunks;
    process(job: Job<FileProcessingJobData>): Promise<any>;
}
