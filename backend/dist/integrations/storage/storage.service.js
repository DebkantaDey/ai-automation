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
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const s3_provider_1 = require("./providers/s3.provider");
const tenant_context_service_1 = require("../../core/tenancy/tenant-context.service");
let StorageService = StorageService_1 = class StorageService {
    storageProvider;
    logger = new common_1.Logger(StorageService_1.name);
    constructor(storageProvider) {
        this.storageProvider = storageProvider;
    }
    buildTenantPath(fileName, subfolder) {
        const orgId = tenant_context_service_1.TenantContextService.getOrganizationId() || 'global';
        const wsId = tenant_context_service_1.TenantContextService.getWorkspaceId();
        const folder = subfolder ? `/${subfolder.replace(/^\//, '')}` : '';
        const wsPath = wsId ? `/workspaces/${wsId}` : '';
        return `orgs/${orgId}${wsPath}${folder}/${Date.now()}-${fileName}`;
    }
    async uploadTenantFile(fileName, buffer, options = {}) {
        const key = this.buildTenantPath(fileName, options.subfolder);
        return this.storageProvider.upload(key, buffer, options);
    }
    async getPresignedTenantUploadUrl(fileName, mimeType, subfolder, expiresIn) {
        const key = this.buildTenantPath(fileName, subfolder);
        return this.storageProvider.getPresignedUploadUrl(key, mimeType, expiresIn);
    }
    async getFileDownloadUrl(key, expiresIn) {
        return this.storageProvider.getDownloadUrl(key, expiresIn);
    }
    async deleteFile(key) {
        return this.storageProvider.delete(key);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_provider_1.S3StorageProvider])
], StorageService);
//# sourceMappingURL=storage.service.js.map