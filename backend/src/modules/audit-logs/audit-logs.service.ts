import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

export interface RecordAuditParams {
  organizationId: string;
  workspaceId?: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async log(params: RecordAuditParams): Promise<void> {
    try {
      const logEntry = new this.auditLogModel({
        organizationId: new Types.ObjectId(params.organizationId),
        workspaceId: params.workspaceId ? new Types.ObjectId(params.workspaceId) : undefined,
        userId: params.userId ? new Types.ObjectId(params.userId) : undefined,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes || {},
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
      await logEntry.save();
    } catch (error: any) {
      this.logger.error(`Failed to write audit log: ${error.message}`);
    }
  }

  async list(organizationId: string, pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: new Types.ObjectId(organizationId),
    };

    if (pagination.search) {
      filter.$or = [
        { action: { $regex: pagination.search, $options: 'i' } },
        { entityType: { $regex: pagination.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
