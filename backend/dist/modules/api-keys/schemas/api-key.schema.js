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
exports.ApiKeySchema = exports.ApiKey = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ApiKey = class ApiKey {
    organizationId;
    workspaceId;
    name;
    keyPrefix;
    keyHash;
    scopes;
    expiresAt;
    status;
    lastUsedAt;
    usageCount;
    createdBy;
    createdAt;
    updatedAt;
};
exports.ApiKey = ApiKey;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApiKey.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApiKey.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ApiKey.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ApiKey.prototype, "keyPrefix", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, select: false, index: true }),
    __metadata("design:type", String)
], ApiKey.prototype, "keyHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: ['*'] }),
    __metadata("design:type", Array)
], ApiKey.prototype, "scopes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ApiKey.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'revoked'], index: true }),
    __metadata("design:type", String)
], ApiKey.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ApiKey.prototype, "lastUsedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ApiKey.prototype, "usageCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ApiKey.prototype, "createdBy", void 0);
exports.ApiKey = ApiKey = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], ApiKey);
exports.ApiKeySchema = mongoose_1.SchemaFactory.createForClass(ApiKey);
exports.ApiKeySchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
exports.ApiKeySchema.index({ keyHash: 1, status: 1 });
//# sourceMappingURL=api-key.schema.js.map