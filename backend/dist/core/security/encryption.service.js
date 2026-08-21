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
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let EncryptionService = EncryptionService_1 = class EncryptionService {
    logger = new common_1.Logger(EncryptionService_1.name);
    algorithm = 'aes-256-gcm';
    masterKey;
    constructor() {
        const rawKey = process.env.ENCRYPTION_KEY || 'default-super-secret-key-32-chars-long!';
        this.masterKey = crypto.createHash('sha256').update(rawKey).digest();
    }
    encrypt(plainText) {
        if (!plainText) {
            return { encryptedData: '', iv: '', tag: '' };
        }
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return {
            encryptedData: encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex'),
        };
    }
    decrypt(payload) {
        if (!payload || !payload.encryptedData) {
            return '';
        }
        try {
            const iv = Buffer.from(payload.iv, 'hex');
            const tag = Buffer.from(payload.tag, 'hex');
            const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
            decipher.setAuthTag(tag);
            let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (err) {
            this.logger.error(`Decryption failed: ${err.message}`);
            throw new Error('Failed to decrypt credential payload. Key or authentication tag mismatch.');
        }
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map