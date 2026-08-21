"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnvironment = validateEnvironment;
function validateEnvironment(config) {
    const requiredKeys = [
        'NODE_ENV',
        'MONGODB_URI',
        'REDIS_HOST',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
    ];
    const missingKeys = requiredKeys.filter((key) => !config[key] && !process.env[key]);
    config.PORT = config.PORT || process.env.PORT || 4000;
    config.NODE_ENV = config.NODE_ENV || process.env.NODE_ENV || 'development';
    config.MONGODB_URI = config.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_automation_saas';
    config.REDIS_HOST = config.REDIS_HOST || process.env.REDIS_HOST || '127.0.0.1';
    config.REDIS_PORT = Number(config.REDIS_PORT || process.env.REDIS_PORT || 6379);
    config.JWT_SECRET = config.JWT_SECRET || process.env.JWT_SECRET || 'dev-jwt-secret-key-min-32-chars-long';
    config.JWT_REFRESH_SECRET = config.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret-min-32-chars';
    if (config.NODE_ENV === 'production') {
        const prodMissing = requiredKeys.filter((k) => !config[k]);
        if (prodMissing.length > 0) {
            throw new Error(`[Environment Validation Failed] Missing required production environment variables: [${prodMissing.join(', ')}]`);
        }
    }
    return config;
}
//# sourceMappingURL=env-validation.js.map