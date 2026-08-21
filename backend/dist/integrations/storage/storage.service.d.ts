import { S3StorageProvider } from './providers/s3.provider';
import { PresignedUploadResult, StorageFile, StorageUploadOptions } from './storage.interface';
export declare class StorageService {
    private readonly storageProvider;
    private readonly logger;
    constructor(storageProvider: S3StorageProvider);
    private buildTenantPath;
    uploadTenantFile(fileName: string, buffer: Buffer, options?: StorageUploadOptions & {
        subfolder?: string;
    }): Promise<StorageFile>;
    getPresignedTenantUploadUrl(fileName: string, mimeType: string, subfolder?: string, expiresIn?: number): Promise<PresignedUploadResult>;
    getFileDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<boolean>;
}
