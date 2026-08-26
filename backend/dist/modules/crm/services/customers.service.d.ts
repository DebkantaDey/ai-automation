import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { CustomerActivity, CustomerActivityDocument } from '../schemas/customer-activity.schema';
import { Deal, DealDocument } from '../schemas/deal.schema';
import { CreateCustomerDto, UpdateCustomerDto, AddCustomerActivityDto } from '../dto/customer.dto';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class CustomersService {
    private readonly customerModel;
    private readonly activityModel;
    private readonly dealModel;
    private readonly eventBus;
    private readonly logger;
    constructor(customerModel: Model<CustomerDocument>, activityModel: Model<CustomerActivityDocument>, dealModel: Model<DealDocument>, eventBus: EventBusService);
    private toObjectId;
    createCustomer(organizationId: string, userId?: string, dto?: CreateCustomerDto, workspaceId?: string): Promise<CustomerDocument>;
    listCustomers(organizationId: string, query?: {
        search?: string;
        status?: string;
        tier?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, CustomerDocument, {}, {}> & Customer & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getCustomerById(organizationId: string, id: string): Promise<CustomerDocument>;
    getCustomer360(organizationId: string, customerId: string): Promise<{
        customer: CustomerDocument;
        activities: (import("mongoose").Document<unknown, {}, CustomerActivityDocument, {}, {}> & CustomerActivity & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        deals: (import("mongoose").Document<unknown, {}, DealDocument, {}, {}> & Deal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        metrics: {
            totalSpend: number;
            lifetimeValue: number;
            openDealsCount: number;
            wonDealsValue: number;
        };
    }>;
    addActivity(organizationId: string, customerId: string, dto: AddCustomerActivityDto, userId?: string): Promise<CustomerActivityDocument>;
    updateCustomer(organizationId: string, id: string, dto: UpdateCustomerDto, userId?: string): Promise<CustomerDocument>;
    deleteCustomer(organizationId: string, id: string, userId?: string): Promise<boolean>;
}
