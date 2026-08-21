import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { FileProcessingProcessor } from './processors/file-processing.processor';
import { KnowledgeBase, KnowledgeBaseSchema } from './schemas/knowledge-base.schema';
import { Document, DocumentSchema } from './schemas/document.schema';
import { DocumentChunk, DocumentChunkSchema } from './schemas/document-chunk.schema';
import { QUEUE_FILE_PROCESSING } from '../../core/queue/queue.constants';
import { AiModule } from '../../integrations/ai/ai.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeBase.name, schema: KnowledgeBaseSchema },
      { name: Document.name, schema: DocumentSchema },
      { name: DocumentChunk.name, schema: DocumentChunkSchema },
    ]),
    BullModule.registerQueue({
      name: QUEUE_FILE_PROCESSING,
    }),
    AiModule,
  ],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService, FileProcessingProcessor],
  exports: [KnowledgeBaseService, MongooseModule],
})
export class KnowledgeBaseModule {}
