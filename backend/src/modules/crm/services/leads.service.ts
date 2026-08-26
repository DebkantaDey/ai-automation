import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from '../schemas/lead.schema';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { Deal, DealDocument } from '../schemas/deal.schema';
import { CustomerActivity, CustomerActivityDocument } from '../schemas/customer-activity.schema';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dto/lead.dto';
import { LeadScoringService } from './lead-scoring.service';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(Deal.name) private readonly dealModel: Model<DealDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    private readonly scoringService: LeadScoringService,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createLead(
    organizationId: string,
    userId?: string,
    dto?: CreateLeadDto,
    workspaceId?: string,
  ): Promise<LeadDocument> {
    const lead = new this.leadModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
      assignedUserId: dto?.assignedUserId ? this.toObjectId(dto.assignedUserId) : undefined,
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });

    // Automatically score the lead
    const scoreResult = await this.scoringService.scoreLead(lead);
    lead.leadScore = scoreResult.score;
    lead.scoreConfidence = scoreResult.confidence;
    lead.scoreReasons = scoreResult.reasons;
    lead.priority = scoreResult.priority;
    lead.scoreGeneratedAt = new Date();

    await lead.save();

    this.logger.log(`Created lead [${lead.name}] with score [${lead.leadScore}] in Org [${organizationId}]`);

    this.eventBus.emit(
      'crm.lead_created',
      organizationId,
      workspaceId,
      { leadId: lead._id, score: lead.leadScore, priority: lead.priority },
    );

    return lead;
  }

  async listLeads(
    organizationId: string,
    query: {
      search?: string;
      status?: string;
      source?: string;
      priority?: string;
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

    if (query.status && query.status !== 'ALL') {
      filter.status = query.status.toLowerCase();
    }
    if (query.source) {
      filter.source = query.source.toLowerCase();
    }
    if (query.priority) {
      filter.priority = query.priority.toLowerCase();
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { company: regex }, { phone: regex }];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('assignedUserId', 'firstName lastName email')
        .exec(),
      this.leadModel.countDocuments(filter).exec(),
    ]);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLeadById(organizationId: string, id: string): Promise<LeadDocument> {
    const lead = await this.leadModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('assignedUserId', 'firstName lastName email')
      .exec();

    if (!lead) {
      throw new NotFoundException(`Lead with id '${id}' not found`);
    }
    return lead;
  }

  async updateLead(
    organizationId: string,
    id: string,
    dto: UpdateLeadDto,
    userId?: string,
  ): Promise<LeadDocument> {
    const lead = await this.getLeadById(organizationId, id);

    Object.assign(lead, {
      ...dto,
      assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : lead.assignedUserId,
      updatedBy: userId ? this.toObjectId(userId) : undefined,
    });

    await lead.save();

    this.eventBus.emit(
      'crm.lead_updated',
      organizationId,
      lead.workspaceId?.toString(),
      { leadId: lead._id, status: lead.status },
    );

    return lead;
  }

  async scoreLeadById(
    organizationId: string,
    id: string,
    promptContext?: string,
  ): Promise<LeadDocument> {
    const lead = await this.getLeadById(organizationId, id);
    const scoreResult = await this.scoringService.scoreLead(lead, promptContext);

    lead.leadScore = scoreResult.score;
    lead.scoreConfidence = scoreResult.confidence;
    lead.scoreReasons = scoreResult.reasons;
    lead.priority = scoreResult.priority;
    lead.scoreGeneratedAt = new Date();

    await lead.save();
    return lead;
  }

  async convertLead(
    organizationId: string,
    userId: string,
    id: string,
    dto: ConvertLeadDto,
  ) {
    const lead = await this.getLeadById(organizationId, id);

    // 1. Create or link Customer
    const customer = new this.customerModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: lead.workspaceId,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: 'active',
      tier: 'starter',
      convertedFromLeadId: lead._id,
      aiInsights: `Converted from lead with score ${lead.leadScore}/100. ${lead.scoreReasons?.join('. ')}`,
      createdBy: this.toObjectId(userId),
    });
    await customer.save();

    // 2. Create Deal if title/value provided
    let deal: DealDocument | null = null;
    if (dto.dealTitle || dto.dealValue) {
      deal = new this.dealModel({
        organizationId: this.toObjectId(organizationId),
        workspaceId: lead.workspaceId,
        title: dto.dealTitle || `Deal - ${lead.company || lead.name}`,
        customerId: customer._id,
        leadId: lead._id,
        value: dto.dealValue || 0,
        stage: 'qualified',
        probability: 60,
        createdBy: this.toObjectId(userId),
      });
      await deal.save();
    }

    // 3. Record conversion activity
    const activity = new this.activityModel({
      organizationId: this.toObjectId(organizationId),
      customerId: customer._id,
      leadId: lead._id,
      activityType: 'stage_change',
      title: 'Lead Converted to Customer',
      description: `Lead [${lead.name}] converted into Customer account [${customer._id}]`,
      source: 'human',
      createdBy: this.toObjectId(userId),
    });
    await activity.save();

    // 4. Update Lead status
    lead.status = 'won';
    lead.convertedCustomerId = customer._id;
    await lead.save();

    this.eventBus.emit(
      'crm.lead_converted',
      organizationId,
      lead.workspaceId?.toString(),
      { leadId: lead._id, customerId: customer._id, dealId: deal?._id },
    );

    return {
      lead,
      customer,
      deal,
    };
  }

  async deleteLead(organizationId: string, id: string, userId?: string): Promise<boolean> {
    const lead = await this.getLeadById(organizationId, id);
    lead.isDeleted = true;
    lead.deletedAt = new Date();
    lead.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await lead.save();
    return true;
  }
}
