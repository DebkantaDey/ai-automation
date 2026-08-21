import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { QUEUE_FILE_PROCESSING } from '../../../core/queue/queue.constants';
import { Document, DocumentDocument } from '../schemas/document.schema';
import { DocumentChunk, DocumentChunkDocument } from '../schemas/document-chunk.schema';
import { KnowledgeBase, KnowledgeBaseDocument } from '../schemas/knowledge-base.schema';
import { AiGatewayService } from '../../../integrations/ai/ai-gateway.service';

export interface FileProcessingJobData {
  documentId: string;
  knowledgeBaseId: string;
  organizationId: string;
  workspaceId: string;
  rawText: string;
  name: string;
}

@Processor(QUEUE_FILE_PROCESSING)
export class FileProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(FileProcessingProcessor.name);

  constructor(
    @InjectModel(Document.name) private readonly documentModel: Model<DocumentDocument>,
    @InjectModel(DocumentChunk.name) private readonly chunkModel: Model<DocumentChunkDocument>,
    @InjectModel(KnowledgeBase.name) private readonly kbModel: Model<KnowledgeBaseDocument>,
    private readonly aiGateway: AiGatewayService,
  ) {
    super();
  }

  private splitIntoChunks(text: string, chunkSize = 500, overlap = 50): string[] {
    const cleanText = text.replace(/\r\n/g, '\n').trim();
    if (!cleanText) return [];

    const chunks: string[] = [];
    let start = 0;

    while (start < cleanText.length) {
      let end = start + chunkSize;
      if (end >= cleanText.length) {
        chunks.push(cleanText.substring(start));
        break;
      }

      // Try to break at a sentence or paragraph boundary
      const nextNewline = cleanText.indexOf('\n', end - 100);
      if (nextNewline !== -1 && nextNewline <= end + 50) {
        end = nextNewline + 1;
      } else {
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

  async process(job: Job<FileProcessingJobData>): Promise<any> {
    const { documentId, knowledgeBaseId, organizationId, workspaceId, rawText, name } = job.data;

    this.logger.log(`Processing document [${name}] (ID: ${documentId}) for Knowledge Base [${knowledgeBaseId}]`);

    const doc = await this.documentModel.findById(new Types.ObjectId(documentId));
    if (!doc) return;

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

      // Generate dense embeddings vectors via AI Gateway
      const embeddingRes = await this.aiGateway.generateEmbeddings(textChunks);

      const chunkDocs = textChunks.map((chunkText, idx) => ({
        organizationId: new Types.ObjectId(organizationId),
        workspaceId: new Types.ObjectId(workspaceId),
        knowledgeBaseId: new Types.ObjectId(knowledgeBaseId),
        documentId: new Types.ObjectId(documentId),
        chunkIndex: idx,
        text: chunkText,
        embedding: embeddingRes.embeddings[idx] || new Array(1536).fill(0),
        metadata: { documentName: name, chunkIndex: idx, totalChunks: textChunks.length },
      }));

      await this.chunkModel.insertMany(chunkDocs);

      doc.status = 'processed';
      doc.chunksCount = textChunks.length;
      await doc.save();

      await this.kbModel.updateOne(
        { _id: new Types.ObjectId(knowledgeBaseId) },
        { $inc: { documentsCount: 1, totalChunks: textChunks.length } },
      );

      this.logger.log(`Successfully indexed document [${name}] with ${textChunks.length} embedding vectors`);
    } catch (err: any) {
      this.logger.error(`Failed to process document [${documentId}]: ${err.message}`, err.stack);
      doc.status = 'failed';
      doc.error = err.message;
      await doc.save();
      throw err;
    }
  }
}
