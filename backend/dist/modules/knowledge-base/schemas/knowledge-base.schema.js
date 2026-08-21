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
exports.KnowledgeBaseSchema = exports.KnowledgeBase = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let KnowledgeBase = class KnowledgeBase {
    organizationId;
    workspaceId;
    name;
    description;
    documentsCount;
    totalChunks;
    embeddingModel;
    status;
    createdBy;
    createdAt;
    updatedAt;
};
exports.KnowledgeBase = KnowledgeBase;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], KnowledgeBase.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], KnowledgeBase.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], KnowledgeBase.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], KnowledgeBase.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KnowledgeBase.prototype, "documentsCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], KnowledgeBase.prototype, "totalChunks", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'text-embedding-3-small' }),
    __metadata("design:type", String)
], KnowledgeBase.prototype, "embeddingModel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'archived'], index: true }),
    __metadata("design:type", String)
], KnowledgeBase.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], KnowledgeBase.prototype, "createdBy", void 0);
exports.KnowledgeBase = KnowledgeBase = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], KnowledgeBase);
exports.KnowledgeBaseSchema = mongoose_1.SchemaFactory.createForClass(KnowledgeBase);
exports.KnowledgeBaseSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
//# sourceMappingURL=knowledge-base.schema.js.map