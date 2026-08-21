import { Injectable, Logger } from '@nestjs/common';
import { S3StorageProvider } from './providers/s3.provider';
import { PresignedUploadResult, StorageFile, StorageUploadOptions } from './storage.interface';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private readonly storageProvider: S3StorageProvider) {}

  private buildTenantPath(fileName: string, subfolder?: string): string {
    const orgId = TenantContextService.getOrganizationId() || 'global';
    const wsId = TenantContextService.getWorkspaceId();
    const folder = subfolder ? `/${subfolder.replace(/^\//, '')}` : '';
    const wsPath = wsId ? `/workspaces/${wsId}` : '';

    return `orgs/${orgId}${wsPath}${folder}/${Date.now()}-${fileName}`;
  }

  async uploadTenantFile(
    fileName: string,
    buffer: Buffer,
    options: StorageUploadOptions & { subfolder?: string } = {},
  ): Promise<StorageFile> {
    const key = this.buildTenantPath(fileName, options.subfolder);
    return this.storageProvider.upload(key, buffer, options);
  }

  async getPresignedTenantUploadUrl(
    fileName: string,
    mimeType: string,
    subfolder?: string,
    expiresIn?: number,
  ): Promise<PresignedUploadResult> {
    const key = this.buildTenantPath(fileName, subfolder);
    return this.storageProvider.getPresignedUploadUrl(key, mimeType, expiresIn);
  }

  async getFileDownloadUrl(key: string, expiresIn?: number): Promise<string> {
    return this.storageProvider.getDownloadUrl(key, expiresIn);
  }

  async deleteFile(key: string): Promise<boolean> {
    return this.storageProvider.delete(key);
  }
}
