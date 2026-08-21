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
var FileProcessingProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessingProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const queue_constants_1 = require("../../../core/queue/queue.constants");
const document_schema_1 = require("../schemas/document.schema");
const document_chunk_schema_1 = require("../schemas/document-chunk.schema");
const knowledge_base_schema_1 = require("../schemas/knowledge-base.schema");
const ai_gateway_service_1 = require("../../../integrations/ai/ai-gateway.service");
let FileProcessingProcessor = FileProcessingProcessor_1 = class FileProcessingProcessor extends bullmq_1.WorkerHost {
    documentModel;
    chunkModel;
    kbModel;
    aiGateway;
    logger = new common_1.Logger(FileProcessingProcessor_1.name);
    constructor(documentModel, chunkModel, kbModel, aiGateway) {
        super();
        this.documentModel = documentModel;
        this.chunkModel = chunkModel;
        this.kbModel = kbModel;
        this.aiGateway = aiGateway;
    }
    splitIntoChunks(text, chunkSize = 500, overlap = 50) {
        const cleanText = text.replace(/\r\n/g, '\n').trim();
        if (!cleanText)
            return [];
        const chunks = [];
        let start = 0;
        while (start < cleanText.length) {
            let end = start + chunkSize;
            if (end >= cleanText.length) {
                chunks.push(cleanText.substring(start));
                break;
            }
            const nextNewline = cleanText.indexOf('\n', end - 100);
            if (nextNewline !== -1 && nextNewline <= end + 50) {
                end = nextNewline + 1;
            }
            else {
                const nextSpace = cleanText.indexOf(' ', end);
                if (nextSpace !== -1 && nextSpace <= end + 30) {
                    end = nextSpace + 1;
                }
            }
            chunks.push(cleanText.substring(start, end).trim());
            start = end - overlap;
        }
        return chunks.filter((c) => c.length > 5);
    }
    async process(job) {
        const { documentId, knowledgeBaseId, organizationId, workspaceId, rawText, name } = job.data;
        this.logger.log(`Processing document [${name}] (ID: ${documentId}) for Knowledge Base [${knowledgeBaseId}]`);
        const doc = await this.documentModel.findById(new mongoose_2.Types.ObjectId(documentId));
        if (!doc)
            return;
        doc.status = 'processing';
        await doc.save();
        try {
            const textToProcess = rawText || doc.rawText || '';
            const textChunks = this.splitIntoChunks(textToProcess);
            if (textChunks.length === 0) {
                doc.status = 'processed';
                doc.chunksCount = 0;
                await doc.save();
                return;
            }
            const embeddingRes = await this.aiGateway.generateEmbeddings(textChunks);
            const chunkDocs = textChunks.map((chunkText, idx) => ({
                organizationId: new mongoose_2.Types.ObjectId(organizationId),
                workspaceId: new mongoose_2.Types.ObjectId(workspaceId),
                knowledgeBaseId: new mongoose_2.Types.ObjectId(knowledgeBaseId),
                documentId: new mongoose_2.Types.ObjectId(documentId),
                chunkIndex: idx,
                text: chunkText,
                embedding: embeddingRes.embeddings[idx] || new Array(1536).fill(0),
                metadata: { documentName: name, chunkIndex: idx, totalChunks: textChunks.length },
            }));
            await this.chunkModel.insertMany(chunkDocs);
            doc.status = 'processed';
            doc.chunksCount = textChunks.length;
            await doc.save();
            await this.kbModel.updateOne({ _id: new mongoose_2.Types.ObjectId(knowledgeBaseId) }, { $inc: { documentsCount: 1, totalChunks: textChunks.length } });
            this.logger.log(`Successfully indexed document [${name}] with ${textChunks.length} embedding vectors`);
        }
        catch (err) {
            this.logger.error(`Failed to process document [${documentId}]: ${err.message}`, err.stack);
            doc.status = 'failed';
            doc.error = err.message;
            await doc.save();
            throw err;
        }
    }
};
exports.FileProcessingProcessor = FileProcessingProcessor;
exports.FileProcessingProcessor = FileProcessingProcessor = FileProcessingProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.QUEUE_FILE_PROCESSING),
    __param(0, (0, mongoose_1.InjectModel)(document_schema_1.Document.name)),
    __param(1, (0, mongoose_1.InjectModel)(document_chunk_schema_1.DocumentChunk.name)),
    __param(2, (0, mongoose_1.InjectModel)(knowledge_base_schema_1.KnowledgeBase.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        ai_gateway_service_1.AiGatewayService])
], FileProcessingProcessor);
//# sourceMappingURL=file-processing.processor.js.map