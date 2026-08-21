import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ApiKey, ApiKeyDocument } from './schemas/api-key.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

export interface CreateApiKeyDto {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKeyDocument>,
    @Optional() private readonly auditLogsService?: AuditLogsService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  private hashKey(secretKey: string): string {
    return crypto.createHash('sha256').update(secretKey).digest('hex');
  }

  async createApiKey(
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: CreateApiKeyDto,
  ): Promise<{ apiKey: ApiKeyDocument; secretKey: string }> {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('API Key name is required');
    }

    // Generate secure random API key token (format: ak_live_<48 hex chars>)
    const randomHex = crypto.randomBytes(24).toString('hex');
    const secretKey = `ak_live_${randomHex}`;
    const keyHash = this.hashKey(secretKey);
    const keyPrefix = `ak_live_${randomHex.substring(0, 8)}...`;

    let expiresAt: Date | undefined;
    if (dto.expiresInDays && dto.expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + dto.expiresInDays);
    }

    const apiKey = new this.apiKeyModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      name: dto.name.trim(),
      keyPrefix,
      keyHash,
      scopes: dto.scopes && dto.scopes.length > 0 ? dto.scopes : ['*'],
      expiresAt,
      status: 'active',
      createdBy: this.toObjectId(userId),
    });

    await apiKey.save();

    if (this.auditLogsService) {
      await this.auditLogsService.log({
        organizationId,
        workspaceId,
        userId,
        action: 'api_key.created',
        entityType: 'ApiKey',
        entityId: apiKey._id.toString(),
        changes: { name: apiKey.name, scopes: apiKey.scopes, keyPrefix },
      });
    }

    return { apiKey, secretKey };
  }

  async listApiKeys(organizationId: string, workspaceId: string, pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    };

    const [data, total] = await Promise.all([
      this.apiKeyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.apiKeyModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async revokeApiKey(
    id: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
  ): Promise<ApiKeyDocument> {
    const apiKey = await this.apiKeyModel.findOneAndUpdate(
      {
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      },
      { $set: { status: 'revoked' } },
      { new: true },
    );

    if (!apiKey) {
      throw new NotFoundException('API Key not found');
    }

    if (this.auditLogsService) {
      await this.auditLogsService.log({
        organizationId,
        workspaceId,
        userId,
        action: 'api_key.revoked',
        entityType: 'ApiKey',
        entityId: apiKey._id.toString(),
        changes: { status: 'revoked' },
      });
    }

    return apiKey;
  }

  async validateKey(rawKey: string): Promise<ApiKeyDocument> {
    if (!rawKey || !rawKey.startsWith('ak_live_')) {
      throw new UnauthorizedException('Invalid API Key format');
    }

    const keyHash = this.hashKey(rawKey);

    const apiKey = await this.apiKeyModel
      .findOne({ keyHash, status: 'active' })
      .select('+keyHash')
      .exec();

    if (!apiKey) {
      throw new UnauthorizedException('Invalid or revoked API Key');
    }

    if (apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)) {
      throw new UnauthorizedException('API Key has expired');
    }

    // Increment usage counter asynchronously
    this.apiKeyModel
      .updateOne(
        { _id: apiKey._id },
        { $inc: { usageCount: 1 }, $set: { lastUsedAt: new Date() } },
      )
      .exec()
      .catch((err) => this.logger.warn(`Failed to update key usage: ${err.message}`));

    return apiKey;
  }
}
