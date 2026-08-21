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
exports.DocumentSchema = exports.Document = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Document = class Document {
    organizationId;
    workspaceId;
    knowledgeBaseId;
    name;
    mimeType;
    sizeBytes;
    fileUrl;
    rawText;
    chunksCount;
    status;
    error;
    uploadedBy;
    createdAt;
    updatedAt;
};
exports.Document = Document;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Document.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Document.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'KnowledgeBase', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Document.prototype, "knowledgeBaseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Document.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'text/plain' }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Document.prototype, "sizeBytes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Document.prototype, "fileUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Document.prototype, "rawText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Document.prototype, "chunksCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'uploaded',
        enum: ['uploaded', 'processing', 'processed', 'failed'],
        index: true,
    }),
    __metadata("design:type", String)
], Document.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], Document.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Document.prototype, "uploadedBy", void 0);
exports.Document = Document = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Document);
exports.DocumentSchema = mongoose_1.SchemaFactory.createForClass(Document);
exports.DocumentSchema.index({ knowledgeBaseId: 1, createdAt: -1 });
exports.DocumentSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
//# sourceMappingURL=document.schema.js.map