import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    listTemplates(): import("./templates.constants").WorkflowTemplate[];
    listVerticals(): import("./verticals.constants").VerticalBlueprint[];
    getVerticalBySlug(slug: string): import("./verticals.constants").VerticalBlueprint;
    instantiateVertical(slug: string, orgId: string, wsId: string, userId: string): Promise<{
        success: boolean;
        blueprint: {
            slug: string;
            name: string;
            industry: "Real Estate" | "Healthcare & Clinics" | "Education & Coaching" | "Salons & Spas" | "Contractors & Services";
            pipelineStages: string[];
        };
        instantiatedAssets: {
            workflow: {
                id: import("mongoose").Types.ObjectId;
                name: string;
            };
            agent: {
                id: any;
                name: any;
            };
            seededLeadsCount: number;
            sampleCustomer: {
                id: any;
                name: any;
            };
            sampleInvoice: {
                id: any;
                invoiceNumber: any;
                total: any;
            };
        };
    }>;
    getTemplateBySlug(slug: string): import("./templates.constants").WorkflowTemplate;
    cloneTemplate(slug: string, orgId: string, wsId: string, userId: string, customName?: string): Promise<import("../workflows/schemas/workflow.schema").WorkflowDocument>;
}
