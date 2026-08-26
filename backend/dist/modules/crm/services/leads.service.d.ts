import { Model, Types } from 'mongoose';
import { Lead, LeadDocument } from '../schemas/lead.schema';
import { Customer, CustomerDocument } from '../schemas/customer.schema';
import { DealDocument } from '../schemas/deal.schema';
import { CustomerActivityDocument } from '../schemas/customer-activity.schema';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dto/lead.dto';
import { LeadScoringService } from './lead-scoring.service';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class LeadsService {
    private readonly leadModel;
    private readonly customerModel;
    private readonly dealModel;
    private readonly activityModel;
    private readonly scoringService;
    private readonly eventBus;
    private readonly logger;
    constructor(leadModel: Model<LeadDocument>, customerModel: Model<CustomerDocument>, dealModel: Model<DealDocument>, activityModel: Model<CustomerActivityDocument>, scoringService: LeadScoringService, eventBus: EventBusService);
    private toObjectId;
    createLead(organizationId: string, userId?: string, dto?: CreateLeadDto, workspaceId?: string): Promise<LeadDocument>;
    listLeads(organizationId: string, query?: {
        search?: string;
        status?: string;
        source?: string;
        priority?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, LeadDocument, {}, {}> & Lead & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    getLeadById(organizationId: string, id: string): Promise<LeadDocument>;
    updateLead(organizationId: string, id: string, dto: UpdateLeadDto, userId?: string): Promise<LeadDocument>;
    scoreLeadById(organizationId: string, id: string, promptContext?: string): Promise<LeadDocument>;
    convertLead(organizationId: string, userId: string, id: string, dto: ConvertLeadDto): Promise<{
        lead: LeadDocument;
        customer: import("mongoose").Document<unknown, {}, CustomerDocument, {}, {}> & Customer & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        deal: DealDocument;
    }>;
    deleteLead(organizationId: string, id: string, userId?: string): Promise<boolean>;
}
