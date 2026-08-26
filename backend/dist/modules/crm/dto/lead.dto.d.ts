import { LeadStatus, LeadPriority } from '../schemas/lead.schema';
export declare class CreateLeadDto {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    source?: string;
    status?: LeadStatus;
    priority?: LeadPriority;
    tags?: string[];
    notes?: string;
    assignedUserId?: string;
    customFields?: Record<string, any>;
}
export declare class UpdateLeadDto {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: LeadStatus;
    priority?: LeadPriority;
    leadScore?: number;
    tags?: string[];
    notes?: string;
    assignedUserId?: string;
    customFields?: Record<string, any>;
}
export declare class ConvertLeadDto {
    dealTitle?: string;
    dealValue?: number;
}
