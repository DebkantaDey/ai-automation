import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApprovalRequest, ApprovalRequestDocument, ApprovalStatus } from '../schemas/approval-request.schema';
import { EventBusService } from '../../../core/events/event-bus.service';

export interface CreateApprovalDto {
  actionType: 'issue_refund' | 'send_mass_whatsapp' | 'apply_discount' | 'delete_record' | 'custom';
  title: string;
  reason: string;
  payload: Record<string, any>;
  agentId?: string;
  executionId?: string;
  requestedByAgentName?: string;
}

@Injectable()
export class ApprovalsService {
  private readonly logger = new Logger(ApprovalsService.name);

  constructor(
    @InjectModel(ApprovalRequest.name)
    private readonly approvalModel: Model<ApprovalRequestDocument>,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createApproval(
    organizationId: string,
    dto: CreateApprovalDto,
    workspaceId?: string,
  ): Promise<ApprovalRequestDocument> {
    const approval = new this.approvalModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
      agentId: dto.agentId ? this.toObjectId(dto.agentId) : undefined,
      status: 'pending',
    });

    await approval.save();

    this.logger.log(`Created approval request [${approval.title}] for Org [${organizationId}]`);

    this.eventBus.emit(
      'approvals.requested',
      organizationId,
      workspaceId,
      { approvalId: approval._id, actionType: approval.actionType, title: approval.title },
    );

    return approval;
  }

  async listApprovals(
    organizationId: string,
    query: {
      status?: string;
      actionType?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      isDeleted: false,
    };

    if (query.status && query.status !== 'all') {
      filter.status = query.status.toLowerCase();
    }
    if (query.actionType) {
      filter.actionType = query.actionType;
    }

    const [approvals, total] = await Promise.all([
      this.approvalModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('agentId', 'name model')
        .populate('reviewedByUserId', 'firstName lastName email')
        .exec(),
      this.approvalModel.countDocuments(filter).exec(),
    ]);

    return {
      data: approvals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getApprovalById(organizationId: string, id: string): Promise<ApprovalRequestDocument> {
    const approval = await this.approvalModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('agentId', 'name model')
      .populate('reviewedByUserId', 'firstName lastName email')
      .exec();

    if (!approval) {
      throw new NotFoundException(`Approval request with id '${id}' not found`);
    }
    return approval;
  }

  async reviewApproval(
    organizationId: string,
    id: string,
    userId: string,
    decision: 'approved' | 'rejected',
    reviewNotes?: string,
  ): Promise<ApprovalRequestDocument> {
    const approval = await this.getApprovalById(organizationId, id);

    if (approval.status !== 'pending') {
      throw new BadRequestException(`Approval request is already ${approval.status}`);
    }

    approval.status = decision;
    approval.reviewedByUserId = this.toObjectId(userId);
    approval.reviewedAt = new Date();
    approval.reviewNotes = reviewNotes || `Decision marked as ${decision}`;
    await approval.save();

    this.logger.log(`Approval [${approval._id}] reviewed as [${decision}] by User [${userId}]`);

    this.eventBus.emit(
      'approvals.reviewed',
      organizationId,
      approval.workspaceId?.toString(),
      { approvalId: approval._id, decision, actionType: approval.actionType },
    );

    return approval;
  }
}
