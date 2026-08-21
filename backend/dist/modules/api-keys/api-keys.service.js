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
var ApiKeysService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = require("crypto");
const api_key_schema_1 = require("./schemas/api-key.schema");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
let ApiKeysService = ApiKeysService_1 = class ApiKeysService {
    apiKeyModel;
    auditLogsService;
    logger = new common_1.Logger(ApiKeysService_1.name);
    constructor(apiKeyModel, auditLogsService) {
        this.apiKeyModel = apiKeyModel;
        this.auditLogsService = auditLogsService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    hashKey(secretKey) {
        return crypto.createHash('sha256').update(secretKey).digest('hex');
    }
    async createApiKey(organizationId, workspaceId, userId, dto) {
        if (!dto.name || !dto.name.trim()) {
            throw new common_1.BadRequestException('API Key name is required');
        }
        const randomHex = crypto.randomBytes(24).toString('hex');
        const secretKey = `ak_live_${randomHex}`;
        const keyHash = this.hashKey(secretKey);
        const keyPrefix = `ak_live_${randomHex.substring(0, 8)}...`;
        let expiresAt;
        if (dto.expiresInDays && dto.expiresInDays > 0) {
            expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + dto.expiresInDays);
        }
        const apiKey = new this.apiKeyModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            name: dto.name.trim(),
            keyPrefix,
            keyHash,
            scopes: dto.scopes && dto.scopes.length > 0 ? dto.scopes : ['*'],
            expiresAt,
            status: 'active',
            createdBy: this.toObjectId(userId),
        });
        await apiKey.save();
        if (this.auditLogsService) {
            await this.auditLogsService.log({
                organizationId,
                workspaceId,
                userId,
                action: 'api_key.created',
                entityType: 'ApiKey',
                entityId: apiKey._id.toString(),
                changes: { name: apiKey.name, scopes: apiKey.scopes, keyPrefix },
            });
        }
        return { apiKey, secretKey };
    }
    async listApiKeys(organizationId, workspaceId, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        };
        const [data, total] = await Promise.all([
            this.apiKeyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
            this.apiKeyModel.countDocuments(filter).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async revokeApiKey(id, organizationId, workspaceId, userId) {
        const apiKey = await this.apiKeyModel.findOneAndUpdate({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        }, { $set: { status: 'revoked' } }, { new: true });
        if (!apiKey) {
            throw new common_1.NotFoundException('API Key not found');
        }
        if (this.auditLogsService) {
            await this.auditLogsService.log({
                organizationId,
                workspaceId,
                userId,
                action: 'api_key.revoked',
                entityType: 'ApiKey',
                entityId: apiKey._id.toString(),
                changes: { status: 'revoked' },
            });
        }
        return apiKey;
    }
    async validateKey(rawKey) {
        if (!rawKey || !rawKey.startsWith('ak_live_')) {
            throw new common_1.UnauthorizedException('Invalid API Key format');
        }
        const keyHash = this.hashKey(rawKey);
        const apiKey = await this.apiKeyModel
            .findOne({ keyHash, status: 'active' })
            .select('+keyHash')
            .exec();
        if (!apiKey) {
            throw new common_1.UnauthorizedException('Invalid or revoked API Key');
        }
        if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
            throw new common_1.UnauthorizedException('API Key has expired');
        }
        this.apiKeyModel
            .updateOne({ _id: apiKey._id }, { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } })
            .exec()
            .catch((err) => this.logger.warn(`Failed to update key usage: ${err.message}`));
        return apiKey;
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = ApiKeysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(api_key_schema_1.ApiKey.name)),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        audit_logs_service_1.AuditLogsService])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map