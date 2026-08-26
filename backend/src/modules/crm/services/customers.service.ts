import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { CustomerActivity, CustomerActivityDocument } from '../schemas/customer-activity.schema';
import { Deal, DealDocument } from '../schemas/deal.schema';
import { CreateCustomerDto, UpdateCustomerDto, AddCustomerActivityDto } from '../dto/customer.dto';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    @InjectModel(Deal.name) private readonly dealModel: Model<DealDocument>,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createCustomer(
    organizationId: string,
    userId?: string,
    dto?: CreateCustomerDto,
    workspaceId?: string,
  ): Promise<CustomerDocument> {
    const customer = new this.customerModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
      assignedUserId: dto?.assignedUserId ? this.toObjectId(dto.assignedUserId) : undefined,
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });

    await customer.save();

    // Log initial creation activity
    const activity = new this.activityModel({
      organizationId: this.toObjectId(organizationId),
      customerId: customer._id,
      activityType: 'note',
      title: 'Customer Record Created',
      description: `Customer account established: ${customer.name} (${customer.company || 'Direct Client'})`,
      source: 'human',
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });
    await activity.save();

    this.logger.log(`Created customer [${customer.name}] in Org [${organizationId}]`);

    this.eventBus.emit(
      'crm.customer_created',
      organizationId,
      workspaceId,
      { customerId: customer._id, tier: customer.tier },
    );

    return customer;
  }

  async listCustomers(
    organizationId: string,
    query: {
      search?: string;
      status?: string;
      tier?: string;
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
    if (query.tier) {
      filter.tier = query.tier.toLowerCase();
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.$or = [{ name: regex }, { email: regex }, { company: regex }, { phone: regex }];
    }

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortOrder === 'asc' ? 1 : -1;

    const [customers, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('assignedUserId', 'firstName lastName email')
        .exec(),
      this.customerModel.countDocuments(filter).exec(),
    ]);

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(organizationId: string, id: string): Promise<CustomerDocument> {
    const customer = await this.customerModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('assignedUserId', 'firstName lastName email')
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with id '${id}' not found`);
    }
    return customer;
  }

  /**
   * Aggregates full 360-degree customer profile including interaction history, deals, and AI insights.
   */
  async getCustomer360(organizationId: string, customerId: string) {
    const customer = await this.getCustomerById(organizationId, customerId);

    const [activities, deals] = await Promise.all([
      this.activityModel
        .find({
          customerId: this.toObjectId(customerId),
          organizationId: this.toObjectId(organizationId),
        })
        .sort({ createdAt: -1 })
        .limit(50)
        .exec(),
      this.dealModel
        .find({
          customerId: this.toObjectId(customerId),
          organizationId: this.toObjectId(organizationId),
          isDeleted: false,
        })
        .sort({ createdAt: -1 })
        .exec(),
    ]);

    return {
      customer,
      activities,
      deals,
      metrics: {
        totalSpend: customer.totalSpend,
        lifetimeValue: customer.lifetimeValue,
        openDealsCount: deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost').length,
        wonDealsValue: deals
          .filter((d) => d.stage === 'won')
          .reduce((sum, d) => sum + (d.value || 0), 0),
      },
    };
  }

  async addActivity(
    organizationId: string,
    customerId: string,
    dto: AddCustomerActivityDto,
    userId?: string,
  ): Promise<CustomerActivityDocument> {
    await this.getCustomerById(organizationId, customerId);

    const activity = new this.activityModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      customerId: this.toObjectId(customerId),
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });

    await activity.save();

    // Update last interaction timestamp on customer
    await this.customerModel.updateOne(
      { _id: this.toObjectId(customerId) },
      { $set: { lastInteractionAt: new Date() } },
    );

    return activity;
  }

  async updateCustomer(
    organizationId: string,
    id: string,
    dto: UpdateCustomerDto,
    userId?: string,
  ): Promise<CustomerDocument> {
    const customer = await this.getCustomerById(organizationId, id);

    Object.assign(customer, {
      ...dto,
      assignedUserId: dto.assignedUserId ? this.toObjectId(dto.assignedUserId) : customer.assignedUserId,
      updatedBy: userId ? this.toObjectId(userId) : undefined,
    });

    await customer.save();
    return customer;
  }

  async deleteCustomer(organizationId: string, id: string, userId?: string): Promise<boolean> {
    const customer = await this.getCustomerById(organizationId, id);
    customer.isDeleted = true;
    customer.deletedAt = new Date();
    customer.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await customer.save();
    return true;
  }
}
