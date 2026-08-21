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
exports.IntegrationConnectionSchema = exports.IntegrationConnection = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let IntegrationConnection = class IntegrationConnection {
    organizationId;
    workspaceId;
    provider;
    name;
    status;
    authType;
    credentials;
    metadata;
    errorMessage;
    lastSyncedAt;
    createdBy;
    createdAt;
    updatedAt;
};
exports.IntegrationConnection = IntegrationConnection;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], IntegrationConnection.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], IntegrationConnection.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], IntegrationConnection.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], IntegrationConnection.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'connected',
        enum: ['connected', 'error', 'disconnected'],
        index: true,
    }),
    __metadata("design:type", String)
], IntegrationConnection.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'api_key',
        enum: ['oauth2', 'api_key', 'webhook_url'],
    }),
    __metadata("design:type", String)
], IntegrationConnection.prototype, "authType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            encryptedAccessToken: { type: String, select: false },
            encryptedRefreshToken: { type: String, select: false },
            iv: { type: String, select: false },
            tag: { type: String, select: false },
            apiKey: { type: String, select: false },
            webhookUrl: { type: String, select: false },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], IntegrationConnection.prototype, "credentials", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], IntegrationConnection.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], IntegrationConnection.prototype, "errorMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: () => new Date() }),
    __metadata("design:type", Date)
], IntegrationConnection.prototype, "lastSyncedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], IntegrationConnection.prototype, "createdBy", void 0);
exports.IntegrationConnection = IntegrationConnection = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], IntegrationConnection);
exports.IntegrationConnectionSchema = mongoose_1.SchemaFactory.createForClass(IntegrationConnection);
exports.IntegrationConnectionSchema.index({ organizationId: 1, workspaceId: 1, provider: 1 });
//# sourceMappingURL=integration-connection.schema.js.map