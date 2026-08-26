import { Injectable, NotFoundException, Logger, Optional } from '@nestjs/common';
import { WORKFLOW_TEMPLATES, WorkflowTemplate } from './templates.constants';
import { VERTICAL_BLUEPRINTS, VerticalBlueprint } from './verticals.constants';
import { WorkflowsService } from '../workflows/workflows.service';
import { AgentsService } from '../agents/agents.service';
import { LeadsService } from '../crm/services/leads.service';
import { CustomersService } from '../crm/services/customers.service';
import { InvoicesService } from '../invoices/services/invoices.service';
import { EventBusService } from '../../core/events/event-bus.service';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly workflowsService: WorkflowsService,
    @Optional() private readonly agentsService?: AgentsService,
    @Optional() private readonly leadsService?: LeadsService,
    @Optional() private readonly customersService?: CustomersService,
    @Optional() private readonly invoicesService?: InvoicesService,
    @Optional() private readonly eventBus?: EventBusService,
  ) {}

  listTemplates(): WorkflowTemplate[] {
    return WORKFLOW_TEMPLATES;
  }

  getTemplateBySlug(slug: string): WorkflowTemplate {
    const template = WORKFLOW_TEMPLATES.find((t) => t.slug === slug);
    if (!template) {
      throw new NotFoundException(`Workflow template with slug '${slug}' not found`);
    }
    return template;
  }

  listVerticals(): VerticalBlueprint[] {
    return VERTICAL_BLUEPRINTS;
  }

  getVerticalBySlug(slug: string): VerticalBlueprint {
    const vertical = VERTICAL_BLUEPRINTS.find((v) => v.slug === slug);
    if (!vertical) {
      throw new NotFoundException(`Vertical blueprint with slug '${slug}' not found`);
    }
    return vertical;
  }

  async cloneTemplate(
    slug: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    customName?: string,
  ) {
    const template = this.getTemplateBySlug(slug);

    return this.workflowsService.create(organizationId, workspaceId, userId, {
      name: customName || template.name,
      description: template.description,
      triggerType: template.triggerType,
      nodes: template.nodes,
      edges: template.edges,
    });
  }

  async instantiateVertical(
    slug: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
  ) {
    const vertical = this.getVerticalBySlug(slug);
    this.logger.log(`Instantiating vertical blueprint [${vertical.name}] in Org [${organizationId}] Workspace [${workspaceId}]`);

    // 1. Create Vertical DAG Visual Workflow
    const workflow = await this.workflowsService.create(organizationId, workspaceId, userId, {
      name: vertical.workflow.name,
      description: vertical.workflow.description,
      triggerType: vertical.workflow.triggerType,
      nodes: vertical.workflow.nodes,
      edges: vertical.workflow.edges,
    });

    // 2. Create Vertical Autonomous AI Agent
    let agent: any = null;
    if (this.agentsService) {
      agent = await this.agentsService.createAgent(organizationId, workspaceId, userId, {
        name: vertical.aiAgent.name,
        description: vertical.aiAgent.description,
        instructions: vertical.aiAgent.instructions,
        model: vertical.aiAgent.model || 'gpt-4o',
        tools: vertical.aiAgent.tools.map((tName) => ({
          name: tName,
          description: `Controlled tool: ${tName}`,
          enabled: true,
        })),
      });
    }

    // 3. Seed Sample Leads into CRM
    const createdLeads: any[] = [];
    if (this.leadsService && vertical.sampleLeads.length > 0) {
      for (const leadData of vertical.sampleLeads) {
        const lead = await this.leadsService.createLead(organizationId, userId, {
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          notes: leadData.notes,
          source: 'blueprint_seed',
        }, workspaceId);
        createdLeads.push(lead);
      }
    }

    // 4. Seed First Sample Customer & Sample Service Invoice
    let sampleCustomer: any = null;
    let sampleInvoice: any = null;
    if (this.customersService && this.invoicesService && vertical.sampleServices.length > 0) {
      sampleCustomer = await this.customersService.createCustomer(organizationId, userId, {
        name: vertical.sampleLeads[0]?.name || 'Premier Client',
        email: vertical.sampleLeads[0]?.email || 'client@premier.com',
        phone: vertical.sampleLeads[0]?.phone || '+1 (555) 123-4567',
        company: vertical.sampleLeads[0]?.company || `${vertical.name} Client`,
        tier: 'enterprise',
        tags: [vertical.industry.toLowerCase().replace(/\s+/g, '-')],
      }, workspaceId);

      const firstService = vertical.sampleServices[0];
      sampleInvoice = await this.invoicesService.createInvoice(organizationId, userId, {
        customerId: sampleCustomer._id.toString(),
        items: [
          {
            description: firstService.description,
            quantity: 1,
            unitPrice: firstService.unitPrice,
            amount: firstService.unitPrice,
          },
        ],
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        notes: `Standard package invoice for ${vertical.name}`,
      }, workspaceId);
    }

    if (this.eventBus) {
      this.eventBus.emit(
        'templates.vertical_instantiated',
        organizationId,
        workspaceId,
        {
          slug: vertical.slug,
          industry: vertical.industry,
          workflowId: workflow._id,
          agentId: agent?._id,
        },
      );
    }

    return {
      success: true,
      blueprint: {
        slug: vertical.slug,
        name: vertical.name,
        industry: vertical.industry,
        pipelineStages: vertical.pipelineStages,
      },
      instantiatedAssets: {
        workflow: { id: workflow._id, name: workflow.name },
        agent: agent ? { id: agent._id, name: agent.name } : null,
        seededLeadsCount: createdLeads.length,
        sampleCustomer: sampleCustomer ? { id: sampleCustomer._id, name: sampleCustomer.name } : null,
        sampleInvoice: sampleInvoice ? { id: sampleInvoice._id, invoiceNumber: sampleInvoice.invoiceNumber, total: sampleInvoice.total } : null,
      },
    };
  }
}
