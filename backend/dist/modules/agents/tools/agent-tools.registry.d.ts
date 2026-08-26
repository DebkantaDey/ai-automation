import { LeadsService } from '../../crm/services/leads.service';
import { CustomersService } from '../../crm/services/customers.service';
import { AppointmentsService } from '../../calendar/services/appointments.service';
import { InvoicesService } from '../../invoices/services/invoices.service';
import { WhatsAppService } from '../../inbox/services/whatsapp.service';
import { TasksService } from '../../tasks/services/tasks.service';
export interface ControlledToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, any>;
    requiresApproval?: boolean;
}
export declare const CONTROLLED_TOOLS_CATALOG: ControlledToolDefinition[];
export declare class AgentToolsRegistry {
    private readonly leadsService?;
    private readonly customersService?;
    private readonly appointmentsService?;
    private readonly invoicesService?;
    private readonly whatsappService?;
    private readonly tasksService?;
    private readonly logger;
    constructor(leadsService?: LeadsService, customersService?: CustomersService, appointmentsService?: AppointmentsService, invoicesService?: InvoicesService, whatsappService?: WhatsAppService, tasksService?: TasksService);
    isToolSensitive(toolName: string): boolean;
    getToolDefinition(toolName: string): ControlledToolDefinition | undefined;
    executeTool(organizationId: string, toolName: string, params: Record<string, any>, agentId?: string): Promise<any>;
}
