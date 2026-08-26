import { WorkflowTemplate } from './templates.constants';
import { VerticalBlueprint } from './verticals.constants';
import { WorkflowsService } from '../workflows/workflows.service';
import { AgentsService } from '../agents/agents.service';
import { LeadsService } from '../crm/services/leads.service';
import { CustomersService } from '../crm/services/customers.service';
import { InvoicesService } from '../invoices/services/invoices.service';
import { EventBusService } from '../../core/events/event-bus.service';
export declare class TemplatesService {
    private readonly workflowsService;
    private readonly agentsService?;
    private readonly leadsService?;
    private readonly customersService?;
    private readonly invoicesService?;
    private readonly eventBus?;
    private readonly logger;
    constructor(workflowsService: WorkflowsService, agentsService?: AgentsService, leadsService?: LeadsService, customersService?: CustomersService, invoicesService?: InvoicesService, eventBus?: EventBusService);
    listTemplates(): WorkflowTemplate[];
    getTemplateBySlug(slug: string): WorkflowTemplate;
    listVerticals(): VerticalBlueprint[];
    getVerticalBySlug(slug: string): VerticalBlueprint;
    cloneTemplate(slug: string, organizationId: string, workspaceId: string, userId: string, customName?: string): Promise<import("../workflows/schemas/workflow.schema").WorkflowDocument>;
    instantiateVertical(slug: string, organizationId: string, workspaceId: string, userId: string): Promise<{
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
}
