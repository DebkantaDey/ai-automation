import { registerAs } from '@nestjs/config';

export interface StorageConfig {
  provider: 's3' | 'r2' | 'local';
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrlPrefix?: string;
  signedUrlExpiresIn: number;
}

export default registerAs('storage', (): StorageConfig => ({
  provider: (process.env.STORAGE_PROVIDER as 's3' | 'r2' | 'local') || 's3',
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION || 'us-east-1',
  bucket: process.env.STORAGE_BUCKET || 'auto-saas-bucket',
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
  publicUrlPrefix: process.env.STORAGE_PUBLIC_URL_PREFIX,
  signedUrlExpiresIn: parseInt(process.env.STORAGE_SIGNED_URL_EXPIRES_IN || '3600', 10),
}));
