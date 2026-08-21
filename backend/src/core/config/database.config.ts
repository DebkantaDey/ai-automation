import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  uri: string;
  autoIndex: boolean;
  maxPoolSize: number;
  serverSelectionTimeoutMS: number;
}

export default registerAs('database', (): DatabaseConfig => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_automation_saas',
  autoIndex: process.env.NODE_ENV !== 'production',
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '20', 10),
  serverSelectionTimeoutMS: 5000,
}));
