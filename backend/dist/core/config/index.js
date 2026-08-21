"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingConfig = exports.storageConfig = exports.aiConfig = exports.authConfig = exports.redisConfig = exports.databaseConfig = exports.appConfig = exports.appConfigurations = void 0;
const app_config_1 = require("./app.config");
exports.appConfig = app_config_1.default;
const database_config_1 = require("./database.config");
exports.databaseConfig = database_config_1.default;
const redis_config_1 = require("./redis.config");
exports.redisConfig = redis_config_1.default;
const auth_config_1 = require("./auth.config");
exports.authConfig = auth_config_1.default;
const ai_config_1 = require("./ai.config");
exports.aiConfig = ai_config_1.default;
const storage_config_1 = require("./storage.config");
exports.storageConfig = storage_config_1.default;
const billing_config_1 = require("./billing.config");
exports.billingConfig = billing_config_1.default;
exports.appConfigurations = [
    app_config_1.default,
    database_config_1.default,
    redis_config_1.default,
    auth_config_1.default,
    ai_config_1.default,
    storage_config_1.default,
    billing_config_1.default,
];
//# sourceMappingURL=index.js.map