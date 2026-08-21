import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  PresignedUploadResult,
  StorageFile,
  StorageProviderInterface,
  StorageUploadOptions,
} from '../storage.interface';
import { StorageConfig } from '../../../core/config/storage.config';

@Injectable()
export class S3StorageProvider implements StorageProviderInterface {
  readonly providerName: string;
  private client: S3Client;
  private bucket: string;
  private publicUrlPrefix?: string;
  private defaultExpiresIn: number;
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<StorageConfig>('storage');
    this.providerName = config?.provider || 's3';
    this.bucket = config?.bucket || 'auto-saas-bucket';
    this.publicUrlPrefix = config?.publicUrlPrefix;
    this.defaultExpiresIn = config?.signedUrlExpiresIn || 3600;

    const s3Config: any = {
      region: config?.region || 'us-east-1',
    };

    if (config?.endpoint) {
      s3Config.endpoint = config.endpoint; // Useful for Cloudflare R2 / MinIO
    }

    if (config?.accessKeyId && config?.secretAccessKey) {
      s3Config.credentials = {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      };
    }

    this.client = new S3Client(s3Config);
  }

  async upload(key: string, buffer: Buffer, options: StorageUploadOptions = {}): Promise<StorageFile> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.mimeType || 'application/octet-stream',
      Metadata: options.metadata,
      ACL: options.isPublic ? 'public-read' : undefined,
    });

    const response = await this.client.send(command);

    const url = this.publicUrlPrefix
      ? `${this.publicUrlPrefix.replace(/\/$/, '')}/${key}`
      : `https://${this.bucket}.s3.amazonaws.com/${key}`;

    return {
      key,
      url,
      size: buffer.length,
      mimeType: options.mimeType,
      eTag: response.ETag,
    };
  }

  async getDownloadUrl(key: string, expiresInSeconds: number = this.defaultExpiresIn): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresInSeconds: number = this.defaultExpiresIn,
  ): Promise<PresignedUploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });

    return {
      uploadUrl,
      key,
      headers: { 'Content-Type': mimeType },
      expiresIn: expiresInSeconds,
    };
  }

  async delete(key: string): Promise<boolean> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to delete object ${key}: ${error.message}`);
      return false;
    }
  }
}
