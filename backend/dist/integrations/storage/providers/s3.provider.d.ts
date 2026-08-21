import { ConfigService } from '@nestjs/config';
import { PresignedUploadResult, StorageFile, StorageProviderInterface, StorageUploadOptions } from '../storage.interface';
export declare class S3StorageProvider implements StorageProviderInterface {
    private readonly configService;
    readonly providerName: string;
    private client;
    private bucket;
    private publicUrlPrefix?;
    private defaultExpiresIn;
    private readonly logger;
    constructor(configService: ConfigService);
    upload(key: string, buffer: Buffer, options?: StorageUploadOptions): Promise<StorageFile>;
    getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
    getPresignedUploadUrl(key: string, mimeType: string, expiresInSeconds?: number): Promise<PresignedUploadResult>;
    delete(key: string): Promise<boolean>;
}
