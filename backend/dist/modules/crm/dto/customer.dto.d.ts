import { CustomerStatus, CustomerTier } from '../schemas/customer.schema';
import { ActivityType } from '../schemas/customer-activity.schema';
export declare class CreateCustomerDto {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: CustomerStatus;
    tier?: CustomerTier;
    totalSpend?: number;
    tags?: string[];
    aiInsights?: string;
    assignedUserId?: string;
    customFields?: Record<string, any>;
}
export declare class UpdateCustomerDto {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: CustomerStatus;
    tier?: CustomerTier;
    totalSpend?: number;
    tags?: string[];
    aiInsights?: string;
    churnRisk?: string;
    assignedUserId?: string;
}
export declare class AddCustomerActivityDto {
    activityType: ActivityType;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
    source?: string;
}
