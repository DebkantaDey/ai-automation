"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_automation_saas',
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20', 10),
    serverSelectionTimeoutMS: 5000,
}));
//# sourceMappingURL=database.config.js.map