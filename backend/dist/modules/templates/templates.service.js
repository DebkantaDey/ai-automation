"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const templates_constants_1 = require("./templates.constants");
const verticals_constants_1 = require("./verticals.constants");
const workflows_service_1 = require("../workflows/workflows.service");
const agents_service_1 = require("../agents/agents.service");
const leads_service_1 = require("../crm/services/leads.service");
const customers_service_1 = require("../crm/services/customers.service");
const invoices_service_1 = require("../invoices/services/invoices.service");
const event_bus_service_1 = require("../../core/events/event-bus.service");
let TemplatesService = TemplatesService_1 = class TemplatesService {
    workflowsService;
    agentsService;
    leadsService;
    customersService;
    invoicesService;
    eventBus;
    logger = new common_1.Logger(TemplatesService_1.name);
    constructor(workflowsService, agentsService, leadsService, customersService, invoicesService, eventBus) {
        this.workflowsService = workflowsService;
        this.agentsService = agentsService;
        this.leadsService = leadsService;
        this.customersService = customersService;
        this.invoicesService = invoicesService;
        this.eventBus = eventBus;
    }
    listTemplates() {
        return templates_constants_1.WORKFLOW_TEMPLATES;
    }
    getTemplateBySlug(slug) {
        const template = templates_constants_1.WORKFLOW_TEMPLATES.find((t) => t.slug === slug);
        if (!template) {
            throw new common_1.NotFoundException(`Workflow template with slug '${slug}' not found`);
        }
        return template;
    }
    listVerticals() {
        return verticals_constants_1.VERTICAL_BLUEPRINTS;
    }
    getVerticalBySlug(slug) {
        const vertical = verticals_constants_1.VERTICAL_BLUEPRINTS.find((v) => v.slug === slug);
        if (!vertical) {
            throw new common_1.NotFoundException(`Vertical blueprint with slug '${slug}' not found`);
        }
        return vertical;
    }
    async cloneTemplate(slug, organizationId, workspaceId, userId, customName) {
        const template = this.getTemplateBySlug(slug);
        return this.workflowsService.create(organizationId, workspaceId, userId, {
            name: customName || template.name,
            description: template.description,
            triggerType: template.triggerType,
            nodes: template.nodes,
            edges: template.edges,
        });
    }
    async instantiateVertical(slug, organizationId, workspaceId, userId) {
        const vertical = this.getVerticalBySlug(slug);
        this.logger.log(`Instantiating vertical blueprint [${vertical.name}] in Org [${organizationId}] Workspace [${workspaceId}]`);
        const workflow = await this.workflowsService.create(organizationId, workspaceId, userId, {
            name: vertical.workflow.name,
            description: vertical.workflow.description,
            triggerType: vertical.workflow.triggerType,
            nodes: vertical.workflow.nodes,
            edges: vertical.workflow.edges,
        });
        let agent = null;
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
        const createdLeads = [];
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
        let sampleCustomer = null;
        let sampleInvoice = null;
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
            this.eventBus.emit('templates.vertical_instantiated', organizationId, workspaceId, {
                slug: vertical.slug,
                industry: vertical.industry,
                workflowId: workflow._id,
                agentId: agent?._id,
            });
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
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = TemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [workflows_service_1.WorkflowsService,
        agents_service_1.AgentsService,
        leads_service_1.LeadsService,
        customers_service_1.CustomersService,
        invoices_service_1.InvoicesService,
        event_bus_service_1.EventBusService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map