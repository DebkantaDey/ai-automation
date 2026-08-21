"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KnowledgeBaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const knowledge_base_schema_1 = require("./schemas/knowledge-base.schema");
const document_schema_1 = require("./schemas/document.schema");
const document_chunk_schema_1 = require("./schemas/document-chunk.schema");
const ai_gateway_service_1 = require("../../integrations/ai/ai-gateway.service");
const usage_service_1 = require("../billing/services/usage.service");
const queue_constants_1 = require("../../core/queue/queue.constants");
let KnowledgeBaseService = KnowledgeBaseService_1 = class KnowledgeBaseService {
    kbModel;
    documentModel;
    chunkModel;
    fileProcessingQueue;
    aiGateway;
    usageService;
    logger = new common_1.Logger(KnowledgeBaseService_1.name);
    constructor(kbModel, documentModel, chunkModel, fileProcessingQueue, aiGateway, usageService) {
        this.kbModel = kbModel;
        this.documentModel = documentModel;
        this.chunkModel = chunkModel;
        this.fileProcessingQueue = fileProcessingQueue;
        this.aiGateway = aiGateway;
        this.usageService = usageService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createKnowledgeBase(organizationId, workspaceId, userId, dto) {
        const kb = new this.kbModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            name: dto.name,
            description: dto.description || '',
            createdBy: this.toObjectId(userId),
        });
        return kb.save();
    }
    async listKnowledgeBases(organizationId, workspaceId, pagination) {
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
    async getKnowledgeBaseById(id, organizationId, workspaceId) {
        const kb = await this.kbModel.findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (!kb) {
            throw new common_1.NotFoundException(`Knowledge Base [${id}] not found`);
        }
        return kb;
    }
    async addDocument(knowledgeBaseId, organizationId, workspaceId, userId, dto) {
        if (!dto.rawText || !dto.rawText.trim()) {
            throw new common_1.BadRequestException('Document text content is required');
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
        await this.fileProcessingQueue.add('process-file', {
            documentId: doc._id.toString(),
            knowledgeBaseId: kb._id.toString(),
            organizationId,
            workspaceId,
            rawText: dto.rawText,
            name: dto.name,
        }, {
            jobId: `doc-${doc._id}`,
            attempts: 3,
        });
        if (this.usageService) {
            await this.usageService.recordDocuments(organizationId, 1);
            await this.usageService.recordStorage(organizationId, doc.sizeBytes);
        }
        return doc;
    }
    async listDocuments(knowledgeBaseId, organizationId, workspaceId, pagination) {
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
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0)
            return 0;
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0)
            return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    async vectorSearch(knowledgeBaseId, organizationId, workspaceId, queryText, topK = 4) {
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
    async askQuestion(knowledgeBaseId, organizationId, workspaceId, question) {
        const relevantChunks = await this.vectorSearch(knowledgeBaseId, organizationId, workspaceId, question, 4);
        const contextText = relevantChunks.length > 0
            ? relevantChunks.map((c, i) => `[Source ${i + 1}]:\n${c.text}`).join('\n\n')
            : 'No relevant documentation found in the knowledge base.';
        const systemPrompt = `You are an accurate RAG assistant for our company documentation.
Use ONLY the provided context to answer the user's question. If the context does not contain the answer, politely state that the answer is not found in the documents.

Context Documentation:
${contextText}`;
        const completion = await this.aiGateway.generateChat([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question },
        ], { temperature: 0.2 });
        return {
            answer: completion.text,
            sources: relevantChunks.map((c) => ({ text: c.text, score: parseFloat(c.score.toFixed(4)), metadata: c.metadata })),
            usage: completion.usage,
        };
    }
};
exports.KnowledgeBaseService = KnowledgeBaseService;
exports.KnowledgeBaseService = KnowledgeBaseService = KnowledgeBaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(knowledge_base_schema_1.KnowledgeBase.name)),
    __param(1, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __param(2, (0, mongoose_1.InjectModel)(document_chunk_schema_1.DocumentChunk.name)),
    __param(3, (0, bullmq_1.InjectQueue)(queue_constants_1.QUEUE_FILE_PROCESSING)),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        bullmq_2.Queue,
        ai_gateway_service_1.AiGatewayService,
        usage_service_1.UsageService])
], KnowledgeBaseService);
//# sourceMappingURL=knowledge-base.service.js.map