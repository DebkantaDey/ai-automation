"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('storage', () => ({
    provider: process.env.STORAGE_PROVIDER || 's3',
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION || 'us-east-1',
    bucket: process.env.STORAGE_BUCKET || 'auto-saas-bucket',
    accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
    secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    publicUrlPrefix: process.env.STORAGE_PUBLIC_URL_PREFIX,
    signedUrlExpiresIn: parseInt(process.env.STORAGE_SIGNED_URL_EXPIRES_IN || '3600', 10),
}));
//# sourceMappingURL=storage.config.js.map