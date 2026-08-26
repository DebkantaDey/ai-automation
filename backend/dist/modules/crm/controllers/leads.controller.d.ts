import { LeadsService } from '../services/leads.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dto/lead.dto';
export declare class LeadsController {
    private readonly leadsService;
    constructor(leadsService: LeadsService);
    createLead(orgId: string, wsId: string, userId: string, dto: CreateLeadDto): Promise<import("../schemas/lead.schema").LeadDocument>;
    listLeads(orgId: string, search?: string, status?: string, source?: string, priority?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/lead.schema").LeadDocument, {}, {}> & import("../schemas/lead.schema").Lead & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    getLeadById(orgId: string, id: string): Promise<import("../schemas/lead.schema").LeadDocument>;
    updateLead(orgId: string, userId: string, id: string, dto: UpdateLeadDto): Promise<import("../schemas/lead.schema").LeadDocument>;
    scoreLead(orgId: string, id: string, promptContext?: string): Promise<import("../schemas/lead.schema").LeadDocument>;
    convertLead(orgId: string, userId: string, id: string, dto: ConvertLeadDto): Promise<{
        lead: import("../schemas/lead.schema").LeadDocument;
        customer: import("mongoose").Document<unknown, {}, import("../schemas/customer.schema").CustomerDocument, {}, {}> & import("../schemas/customer.schema").Customer & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        };
        deal: import("../schemas/deal.schema").DealDocument;
    }>;
    deleteLead(orgId: string, userId: string, id: string): Promise<boolean>;
}
