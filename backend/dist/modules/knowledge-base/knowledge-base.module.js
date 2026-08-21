"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBaseModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const knowledge_base_controller_1 = require("./knowledge-base.controller");
const knowledge_base_service_1 = require("./knowledge-base.service");
const file_processing_processor_1 = require("./processors/file-processing.processor");
const knowledge_base_schema_1 = require("./schemas/knowledge-base.schema");
const document_schema_1 = require("./schemas/document.schema");
const document_chunk_schema_1 = require("./schemas/document-chunk.schema");
const queue_constants_1 = require("../../core/queue/queue.constants");
const ai_module_1 = require("../../integrations/ai/ai.module");
let KnowledgeBaseModule = class KnowledgeBaseModule {
};
exports.KnowledgeBaseModule = KnowledgeBaseModule;
exports.KnowledgeBaseModule = KnowledgeBaseModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: knowledge_base_schema_1.KnowledgeBase.name, schema: knowledge_base_schema_1.KnowledgeBaseSchema },
                { name: document_schema_1.Document.name, schema: document_schema_1.DocumentSchema },
                { name: document_chunk_schema_1.DocumentChunk.name, schema: document_chunk_schema_1.DocumentChunkSchema },
            ]),
            bullmq_1.BullModule.registerQueue({
                name: queue_constants_1.QUEUE_FILE_PROCESSING,
            }),
            ai_module_1.AiModule,
        ],
        controllers: [knowledge_base_controller_1.KnowledgeBaseController],
        providers: [knowledge_base_service_1.KnowledgeBaseService, file_processing_processor_1.FileProcessingProcessor],
        exports: [knowledge_base_service_1.KnowledgeBaseService, mongoose_1.MongooseModule],
    })
], KnowledgeBaseModule);
//# sourceMappingURL=knowledge-base.module.js.map