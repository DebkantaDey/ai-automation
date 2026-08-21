import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { KnowledgeBase, KnowledgeBaseDocument } from './schemas/knowledge-base.schema';
import { Document, DocumentDocument } from './schemas/document.schema';
import { DocumentChunk, DocumentChunkDocument } from './schemas/document-chunk.schema';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
import { UsageService } from '../billing/services/usage.service';
import { QUEUE_FILE_PROCESSING } from '../../core/queue/queue.constants';
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

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectModel(KnowledgeBase.name) private readonly kbModel: Model<KnowledgeBaseDocument>,
    @InjectModel(Document.name) private readonly documentModel: Model<DocumentDocument>,
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<DocumentChunkDocument>,
    @InjectQueue(QUEUE_FILE_PROCESSING) private readonly fileProcessingQueue: Queue,
    private readonly aiGateway: AiGatewayService,
    @Optional() private readonly usageService?: UsageService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createKnowledgeBase(
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: CreateKnowledgeBaseDto,
  ): Promise<KnowledgeBaseDocument> {
    const kb = new this.kbModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      name: dto.name,
      description: dto.description || '',
      createdBy: this.toObjectId(userId),
    });

    return kb.save();
  }

  async listKnowledgeBases(organizationId: string, workspaceId: string, pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      status: 'active',
    };

    const [data, total] = await Promise.all([
      this.kbModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.kbModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getKnowledgeBaseById(id: string, organizationId: string, workspaceId: string): Promise<KnowledgeBaseDocument> {
    const kb = await this.kbModel.findOne({
      _id: this.toObjectId(id),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (!kb) {
      throw new NotFoundException(`Knowledge Base [${id}] not found`);
    }
    return kb;
  }

  async addDocument(
    knowledgeBaseId: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: AddDocumentDto,
  ): Promise<DocumentDocument> {
    if (!dto.rawText || !dto.rawText.trim()) {
      throw new BadRequestException('Document text content is required');
    }

    const kb = await this.getKnowledgeBaseById(knowledgeBaseId, organizationId, workspaceId);

    const doc = new this.documentModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      knowledgeBaseId: kb._id,
      name: dto.name,
      mimeType: dto.mimeType || 'text/plain',
      sizeBytes: Buffer.byteLength(dto.rawText, 'utf8'),
      rawText: dto.rawText,
      status: 'uploaded',
      uploadedBy: this.toObjectId(userId),
    });
    await doc.save();

    // Enqueue document processing background job to BullMQ
    await this.fileProcessingQueue.add(
      'process-file',
      {
        documentId: doc._id.toString(),
        knowledgeBaseId: kb._id.toString(),
        organizationId,
        workspaceId,
        rawText: dto.rawText,
        name: dto.name,
      },
      {
        jobId: `doc-${doc._id}`,
        attempts: 3,
      },
    );

    if (this.usageService) {
      await this.usageService.recordDocuments(organizationId, 1);
      await this.usageService.recordStorage(organizationId, doc.sizeBytes);
    }

    return doc;
  }

  async listDocuments(
    knowledgeBaseId: string,
    organizationId: string,
    workspaceId: string,
    pagination: PaginationQueryDto,
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      knowledgeBaseId: this.toObjectId(knowledgeBaseId),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    };

    const [data, total] = await Promise.all([
      this.documentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.documentModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async vectorSearch(
    knowledgeBaseId: string,
    organizationId: string,
    workspaceId: string,
    queryText: string,
    topK = 4,
  ): Promise<Array<{ chunkId: string; text: string; score: number; metadata: any }>> {
    const queryEmbeddingRes = await this.aiGateway.generateEmbeddings([queryText]);
    const queryVector = queryEmbeddingRes.embeddings[0];

    const chunks = await this.chunkModel.find({
      knowledgeBaseId: this.toObjectId(knowledgeBaseId),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    }).exec();

    const scored = chunks.map((chunk) => {
      const score = this.cosineSimilarity(queryVector, chunk.embedding);
      return {
        chunkId: chunk._id.toString(),
        text: chunk.text,
        score,
        metadata: chunk.metadata,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async askQuestion(
    knowledgeBaseId: string,
    organizationId: string,
    workspaceId: string,
    question: string,
  ) {
    const relevantChunks = await this.vectorSearch(knowledgeBaseId, organizationId, workspaceId, question, 4);

    const contextText = relevantChunks.length > 0
      ? relevantChunks.map((c, i) => `[Source ${i + 1}]:\n${c.text}`).join('\n\n')
      : 'No relevant documentation found in the knowledge base.';

    const systemPrompt = `You are an accurate RAG assistant for our company documentation.
Use ONLY the provided context to answer the user's question. If the context does not contain the answer, politely state that the answer is not found in the documents.

Context Documentation:
${contextText}`;

    const completion = await this.aiGateway.generateChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      { temperature: 0.2 },
    );

    return {
      answer: completion.text,
      sources: relevantChunks.map((c) => ({ text: c.text, score: parseFloat(c.score.toFixed(4)), metadata: c.metadata })),
      usage: completion.usage,
    };
  }
}
