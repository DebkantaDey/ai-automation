export interface StorageFile {
  key: string;
  url: string;
  size?: number;
  mimeType?: string;
  eTag?: string;
}

export interface StorageUploadOptions {
  mimeType?: string;
  isPublic?: boolean;
  metadata?: Record<string, string>;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  headers?: Record<string, string>;
  expiresIn: number;
}

export interface StorageProviderInterface {
  readonly providerName: string;
  upload(key: string, buffer: Buffer, options?: StorageUploadOptions): Promise<StorageFile>;
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getPresignedUploadUrl(key: string, mimeType: string, expiresInSeconds?: number): Promise<PresignedUploadResult>;
  delete(key: string): Promise<boolean>;
}
