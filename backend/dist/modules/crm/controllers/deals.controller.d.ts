import { DealsService } from '../services/deals.service';
import { CreateDealDto, UpdateDealDto } from '../dto/deal.dto';
export declare class DealsController {
    private readonly dealsService;
    constructor(dealsService: DealsService);
    createDeal(orgId: string, wsId: string, userId: string, dto: CreateDealDto): Promise<import("../schemas/deal.schema").DealDocument>;
    listDeals(orgId: string, search?: string, stage?: string, customerId?: string, leadId?: string, page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/deal.schema").DealDocument, {}, {}> & import("../schemas/deal.schema").Deal & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
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
    getPipelineSummary(orgId: string): Promise<{
        totalPipelineValue: number;
        weightedPipelineValue: number;
        winRate: number;
        dealsCount: number;
        wonValue: number;
        stagesCount: Record<string, number>;
    }>;
    getDealById(orgId: string, id: string): Promise<import("../schemas/deal.schema").DealDocument>;
    updateDeal(orgId: string, userId: string, id: string, dto: UpdateDealDto): Promise<import("../schemas/deal.schema").DealDocument>;
    deleteDeal(orgId: string, userId: string, id: string): Promise<boolean>;
}
