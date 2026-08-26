import { Model, Types } from 'mongoose';
import { Deal, DealDocument } from '../schemas/deal.schema';
import { CustomerActivityDocument } from '../schemas/customer-activity.schema';
import { CreateDealDto, UpdateDealDto } from '../dto/deal.dto';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class DealsService {
    private readonly dealModel;
    private readonly activityModel;
    private readonly eventBus;
    private readonly logger;
    constructor(dealModel: Model<DealDocument>, activityModel: Model<CustomerActivityDocument>, eventBus: EventBusService);
    private toObjectId;
    createDeal(organizationId: string, userId?: string, dto?: CreateDealDto, workspaceId?: string): Promise<DealDocument>;
    listDeals(organizationId: string, query?: {
        search?: string;
        stage?: string;
        customerId?: string;
        leadId?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, DealDocument, {}, {}> & Deal & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    getDealById(organizationId: string, id: string): Promise<DealDocument>;
    updateDeal(organizationId: string, id: string, dto: UpdateDealDto, userId?: string): Promise<DealDocument>;
    getPipelineSummary(organizationId: string): Promise<{
        totalPipelineValue: number;
        weightedPipelineValue: number;
        winRate: number;
        dealsCount: number;
        wonValue: number;
        stagesCount: Record<string, number>;
    }>;
    deleteDeal(organizationId: string, id: string, userId?: string): Promise<boolean>;
}
