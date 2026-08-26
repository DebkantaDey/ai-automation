import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Deal, DealDocument } from '../schemas/deal.schema';
import { CustomerActivity, CustomerActivityDocument } from '../schemas/customer-activity.schema';
import { CreateDealDto, UpdateDealDto } from '../dto/deal.dto';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    @InjectModel(Deal.name) private readonly dealModel: Model<DealDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createDeal(
    organizationId: string,
    userId?: string,
    dto?: CreateDealDto,
    workspaceId?: string,
  ): Promise<DealDocument> {
    const deal = new this.dealModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
      customerId: dto?.customerId ? this.toObjectId(dto.customerId) : undefined,
      leadId: dto?.leadId ? this.toObjectId(dto.leadId) : undefined,
      assignedUserId: dto?.assignedUserId ? this.toObjectId(dto.assignedUserId) : undefined,
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });

    await deal.save();

    if (deal.customerId) {
      const activity = new this.activityModel({
        organizationId: this.toObjectId(organizationId),
        customerId: deal.customerId,
        activityType: 'stage_change',
        title: `Deal Created: ${deal.title}`,
        description: `Deal value: $${deal.value.toLocaleString()} (${deal.stage})`,
        source: 'human',
        createdBy: userId ? this.toObjectId(userId) : undefined,
      });
      await activity.save();
    }

    this.logger.log(`Created deal [${deal.title}] valued at [$${deal.value}] in Org [${organizationId}]`);

    this.eventBus.emit(
      'crm.deal_created',
      organizationId,
      workspaceId,
      { dealId: deal._id, value: deal.value, stage: deal.stage },
    );

    return deal;
  }

  async listDeals(
    organizationId: string,
    query: {
      search?: string;
      stage?: string;
      customerId?: string;
      leadId?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      isDeleted: false,
    };

    if (query.stage && query.stage !== 'ALL') {
      filter.stage = query.stage.toLowerCase();
    }
    if (query.customerId) {
      filter.customerId = this.toObjectId(query.customerId);
    }
    if (query.leadId) {
      filter.leadId = this.toObjectId(query.leadId);
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.title = regex;
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [deals, total] = await Promise.all([
      this.dealModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name company email phone')
        .populate('leadId', 'name company email phone')
        .populate('assignedUserId', 'firstName lastName email')
        .exec(),
      this.dealModel.countDocuments(filter).exec(),
    ]);

    return {
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDealById(organizationId: string, id: string): Promise<DealDocument> {
    const deal = await this.dealModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('customerId', 'name company email phone')
      .populate('leadId', 'name company email phone')
      .populate('assignedUserId', 'firstName lastName email')
      .exec();

    if (!deal) {
      throw new NotFoundException(`Deal with id '${id}' not found`);
    }
    return deal;
  }

  async updateDeal(
    organizationId: string,
    id: string,
    dto: UpdateDealDto,
    userId?: string,
  ): Promise<DealDocument> {
    const deal = await this.getDealById(organizationId, id);
    const previousStage = deal.stage;

    Object.assign(deal, {
      ...dto,
      assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : deal.assignedUserId,
      updatedBy: userId ? this.toObjectId(userId) : undefined,
    });

    await deal.save();

    if (dto.stage && dto.stage !== previousStage && deal.customerId) {
      const activity = new this.activityModel({
        organizationId: this.toObjectId(organizationId),
        customerId: deal.customerId,
        activityType: 'stage_change',
        title: `Deal Stage Updated: ${deal.title}`,
        description: `Stage moved from ${previousStage} to ${dto.stage}`,
        source: 'human',
        createdBy: userId ? this.toObjectId(userId) : undefined,
      });
      await activity.save();
    }

    this.eventBus.emit(
      'crm.deal_updated',
      organizationId,
      deal.workspaceId?.toString(),
      { dealId: deal._id, stage: deal.stage, value: deal.value },
    );

    return deal;
  }

  async getPipelineSummary(organizationId: string) {
    const deals = await this.dealModel
      .find({
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .exec();

    const totalPipelineValue = deals
      .filter((d) => d.stage !== 'lost')
      .reduce((sum, d) => sum + (d.value || 0), 0);

    const weightedPipelineValue = deals
      .filter((d) => d.stage !== 'lost')
      .reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 50) / 100), 0);

    const wonDeals = deals.filter((d) => d.stage === 'won');
    const lostDeals = deals.filter((d) => d.stage === 'lost');
    const closedDealsCount = wonDeals.length + lostDeals.length;
    const winRate = closedDealsCount > 0 ? (wonDeals.length / closedDealsCount) * 100 : 0;

    const stagesCount: Record<string, number> = {
      discovery: 0,
      qualified: 0,
      proposal_sent: 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    };

    deals.forEach((d) => {
      if (stagesCount[d.stage] !== undefined) {
        stagesCount[d.stage] += 1;
      }
    });

    return {
      totalPipelineValue,
      weightedPipelineValue: Math.round(weightedPipelineValue),
      winRate: Math.round(winRate * 10) / 10,
      dealsCount: deals.length,
      wonValue: wonDeals.reduce((sum, d) => sum + (d.value || 0), 0),
      stagesCount,
    };
  }

  async deleteDeal(organizationId: string, id: string, userId?: string): Promise<boolean> {
    const deal = await this.getDealById(organizationId, id);
    deal.isDeleted = true;
    deal.deletedAt = new Date();
    deal.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await deal.save();
    return true;
  }
}
