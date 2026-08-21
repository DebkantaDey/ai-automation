import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';
import authConfig from './auth.config';
import aiConfig from './ai.config';
import storageConfig from './storage.config';
import billingConfig from './billing.config';

export const appConfigurations = [
  appConfig,
  databaseConfig,
  redisConfig,
  authConfig,
  aiConfig,
  storageConfig,
  billingConfig,
];

export {
  appConfig,
  databaseConfig,
  redisConfig,
  authConfig,
  aiConfig,
  storageConfig,
  billingConfig,
};
