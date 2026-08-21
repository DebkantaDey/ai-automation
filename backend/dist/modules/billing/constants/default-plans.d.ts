import { PlanLimits } from '../schemas/plan.schema';
export interface DefaultPlanDefinition {
    name: string;
    slug: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    currency: string;
    isPopular: boolean;
    features: string[];
    limits: PlanLimits;
}
export declare const DEFAULT_PLANS: DefaultPlanDefinition[];
