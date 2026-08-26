import { DealStage } from '../schemas/deal.schema';
export declare class CreateDealDto {
    title: string;
    customerId?: string;
    leadId?: string;
    value: number;
    currency?: string;
    stage?: DealStage;
    probability?: number;
    expectedCloseDate?: string;
    assignedUserId?: string;
    notes?: string;
}
export declare class UpdateDealDto {
    title?: string;
    value?: number;
    stage?: DealStage;
    probability?: number;
    expectedCloseDate?: string;
    assignedUserId?: string;
    notes?: string;
}
