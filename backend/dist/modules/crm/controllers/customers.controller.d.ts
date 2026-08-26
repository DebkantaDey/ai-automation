import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto, UpdateCustomerDto, AddCustomerActivityDto } from '../dto/customer.dto';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    createCustomer(orgId: string, wsId: string, userId: string, dto: CreateCustomerDto): Promise<import("../schemas/customer.schema").CustomerDocument>;
    listCustomers(orgId: string, search?: string, status?: string, tier?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/customer.schema").CustomerDocument, {}, {}> & import("../schemas/customer.schema").Customer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getCustomerById(orgId: string, id: string): Promise<import("../schemas/customer.schema").CustomerDocument>;
    getCustomer360(orgId: string, id: string): Promise<{
        customer: import("../schemas/customer.schema").CustomerDocument;
        activities: (import("mongoose").Document<unknown, {}, import("../schemas/customer-activity.schema").CustomerActivityDocument, {}, {}> & import("../schemas/customer-activity.schema").CustomerActivity & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        deals: (import("mongoose").Document<unknown, {}, import("../schemas/deal.schema").DealDocument, {}, {}> & import("../schemas/deal.schema").Deal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    addActivity(orgId: string, userId: string, id: string, dto: AddCustomerActivityDto): Promise<import("../schemas/customer-activity.schema").CustomerActivityDocument>;
    updateCustomer(orgId: string, userId: string, id: string, dto: UpdateCustomerDto): Promise<import("../schemas/customer.schema").CustomerDocument>;
    deleteCustomer(orgId: string, userId: string, id: string): Promise<boolean>;
}
