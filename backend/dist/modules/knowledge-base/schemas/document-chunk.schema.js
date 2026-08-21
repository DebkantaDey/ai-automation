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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentChunkSchema = exports.DocumentChunk = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DocumentChunk = class DocumentChunk {
    organizationId;
    workspaceId;
    knowledgeBaseId;
    documentId;
    chunkIndex;
    text;
    embedding;
    metadata;
    createdAt;
    updatedAt;
};
exports.DocumentChunk = DocumentChunk;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentChunk.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentChunk.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'KnowledgeBase', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentChunk.prototype, "knowledgeBaseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Document', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DocumentChunk.prototype, "documentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], DocumentChunk.prototype, "chunkIndex", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DocumentChunk.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [Number], required: true }),
    __metadata("design:type", Array)
], DocumentChunk.prototype, "embedding", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], DocumentChunk.prototype, "metadata", void 0);
exports.DocumentChunk = DocumentChunk = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], DocumentChunk);
exports.DocumentChunkSchema = mongoose_1.SchemaFactory.createForClass(DocumentChunk);
exports.DocumentChunkSchema.index({ knowledgeBaseId: 1, documentId: 1 });
exports.DocumentChunkSchema.index({ organizationId: 1, workspaceId: 1, knowledgeBaseId: 1 });
//# sourceMappingURL=document-chunk.schema.js.map