import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import authConfig from './auth.config';
import aiConfig from './ai.config';
import storageConfig from './storage.config';
import billingConfig from './billing.config';
export declare const appConfigurations: (((() => import("./app.config").AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./app.config").AppConfig>) | ((() => import("./database.config").DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./database.config").DatabaseConfig>) | ((() => import("./redis.config").RedisConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./redis.config").RedisConfig>) | ((() => import("./auth.config").AuthConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./auth.config").AuthConfig>) | ((() => import("./ai.config").AiConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./ai.config").AiConfig>) | ((() => import("./storage.config").StorageConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./storage.config").StorageConfig>) | ((() => import("./billing.config").BillingConfig) & import("@nestjs/config").ConfigFactoryKeyHost<import("./billing.config").BillingConfig>))[];
export { appConfig, databaseConfig, redisConfig, authConfig, aiConfig, storageConfig, billingConfig, };
