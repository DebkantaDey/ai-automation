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
var S3StorageProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3StorageProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3StorageProvider = S3StorageProvider_1 = class S3StorageProvider {
    configService;
    providerName;
    client;
    bucket;
    publicUrlPrefix;
    defaultExpiresIn;
    logger = new common_1.Logger(S3StorageProvider_1.name);
    constructor(configService) {
        this.configService = configService;
        const config = this.configService.get('storage');
        this.providerName = config?.provider || 's3';
        this.bucket = config?.bucket || 'auto-saas-bucket';
        this.publicUrlPrefix = config?.publicUrlPrefix;
        this.defaultExpiresIn = config?.signedUrlExpiresIn || 3600;
        const s3Config = {
            region: config?.region || 'us-east-1',
        };
        if (config?.endpoint) {
            s3Config.endpoint = config.endpoint;
        }
        if (config?.accessKeyId && config?.secretAccessKey) {
            s3Config.credentials = {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            };
        }
        this.client = new client_s3_1.S3Client(s3Config);
    }
    async upload(key, buffer, options = {}) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: options.mimeType || 'application/octet-stream',
            Metadata: options.metadata,
            ACL: options.isPublic ? 'public-read' : undefined,
        });
        const response = await this.client.send(command);
        const url = this.publicUrlPrefix
            ? `${this.publicUrlPrefix.replace(/\/$/, '')}/${key}`
            : `https://${this.bucket}.s3.amazonaws.com/${key}`;
        return {
            key,
            url,
            size: buffer.length,
            mimeType: options.mimeType,
            eTag: response.ETag,
        };
    }
    async getDownloadUrl(key, expiresInSeconds = this.defaultExpiresIn) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
    }
    async getPresignedUploadUrl(key, mimeType, expiresInSeconds = this.defaultExpiresIn) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: mimeType,
        });
        const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(this.client, command, { expiresIn: expiresInSeconds });
        return {
            uploadUrl,
            key,
            headers: { 'Content-Type': mimeType },
            expiresIn: expiresInSeconds,
        };
    }
    async delete(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            await this.client.send(command);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete object ${key}: ${error.message}`);
            return false;
        }
    }
};
exports.S3StorageProvider = S3StorageProvider;
exports.S3StorageProvider = S3StorageProvider = S3StorageProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3StorageProvider);
//# sourceMappingURL=s3.provider.js.map