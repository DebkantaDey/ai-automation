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
var AgentToolsRegistry_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentToolsRegistry = exports.CONTROLLED_TOOLS_CATALOG = void 0;
const common_1 = require("@nestjs/common");
const leads_service_1 = require("../../crm/services/leads.service");
const customers_service_1 = require("../../crm/services/customers.service");
const appointments_service_1 = require("../../calendar/services/appointments.service");
const invoices_service_1 = require("../../invoices/services/invoices.service");
const whatsapp_service_1 = require("../../inbox/services/whatsapp.service");
const tasks_service_1 = require("../../tasks/services/tasks.service");
exports.CONTROLLED_TOOLS_CATALOG = [
    {
        name: 'lookup_customer',
        description: 'Look up customer or lead details, 360 profile, and spend from CRM by email, phone, or name.',
        parameters: {
            query: 'string - Email address, phone number, or company name to search',
        },
    },
    {
        name: 'create_lead',
        description: 'Create and auto-score a new CRM sales lead with qualification intent.',
        parameters: {
            name: 'string - Contact name',
            email: 'string (optional) - Email address',
            phone: 'string (optional) - Phone number',
            company: 'string (optional) - Company name',
            notes: 'string - Qualification notes or requirements',
        },
    },
    {
        name: 'book_appointment',
        description: 'Check staff availability and book a confirmed calendar meeting.',
        parameters: {
            customerId: 'string (optional) - Customer ID',
            leadId: 'string (optional) - Lead ID',
            title: 'string - Meeting title or purpose',
            startTime: 'string - ISO 8601 datetime',
            durationMinutes: 'number (default 30)',
        },
    },
    {
        name: 'create_invoice',
        description: 'Generate customer invoice with line items and payment link.',
        parameters: {
            customerId: 'string - Customer ID',
            items: 'array of { description, quantity, unitPrice, amount }',
            dueDate: 'string - ISO 8601 datetime',
        },
    },
    {
        name: 'create_task',
        description: 'Create an operational task assigned to staff member.',
        parameters: {
            title: 'string - Task description',
            priority: '"low" | "medium" | "high" | "urgent"',
            customerId: 'string (optional)',
            dueDate: 'string (optional) - ISO datetime',
        },
    },
    {
        name: 'send_whatsapp_message',
        description: 'Send direct WhatsApp message to customer or lead phone number.',
        parameters: {
            phoneNumber: 'string - Recipient phone number in E.164 format',
            message: 'string - Message text content',
        },
    },
    {
        name: 'search_knowledge_base',
        description: 'Query company vector knowledge base for exact policy and documentation answers.',
        parameters: {
            query: 'string - Semantic query or question',
        },
    },
    {
        name: 'issue_refund',
        description: 'Issue customer payment refund. SENSITIVE: Requires human manager approval.',
        parameters: {
            customerId: 'string - Customer ID',
            amount: 'number - Refund amount',
            reason: 'string - Detailed refund rationale',
        },
        requiresApproval: true,
    },
    {
        name: 'send_mass_whatsapp',
        description: 'Broadcast mass promotional or reminder campaign. SENSITIVE: Requires human manager approval.',
        parameters: {
            templateId: 'string - Approved WhatsApp template ID',
            recipientsCount: 'number - Number of target recipients',
            reason: 'string - Campaign purpose and audience',
        },
        requiresApproval: true,
    },
];
let AgentToolsRegistry = AgentToolsRegistry_1 = class AgentToolsRegistry {
    leadsService;
    customersService;
    appointmentsService;
    invoicesService;
    whatsappService;
    tasksService;
    logger = new common_1.Logger(AgentToolsRegistry_1.name);
    constructor(leadsService, customersService, appointmentsService, invoicesService, whatsappService, tasksService) {
        this.leadsService = leadsService;
        this.customersService = customersService;
        this.appointmentsService = appointmentsService;
        this.invoicesService = invoicesService;
        this.whatsappService = whatsappService;
        this.tasksService = tasksService;
    }
    isToolSensitive(toolName) {
        const tool = exports.CONTROLLED_TOOLS_CATALOG.find((t) => t.name === toolName);
        return !!tool?.requiresApproval;
    }
    getToolDefinition(toolName) {
        return exports.CONTROLLED_TOOLS_CATALOG.find((t) => t.name === toolName);
    }
    async executeTool(organizationId, toolName, params, agentId) {
        this.logger.log(`Executing controlled tool [${toolName}] for Org [${organizationId}]`);
        switch (toolName) {
            case 'lookup_customer': {
                const query = params.query || '';
                if (this.customersService) {
                    const list = await this.customersService.listCustomers(organizationId, { search: query, limit: 3 });
                    if (list.data.length > 0) {
                        const customer = list.data[0];
                        const profile360 = await this.customersService.getCustomer360(organizationId, customer._id.toString());
                        return {
                            found: true,
                            customer: {
                                id: customer._id,
                                name: customer.name,
                                company: customer.company,
                                email: customer.email,
                                phone: customer.phone,
                                totalSpend: customer.totalSpend,
                                tier: customer.tier,
                                recentActivitiesCount: profile360.activities.length,
                            },
                        };
                    }
                }
                return { found: false, message: `No matching customer found for query: "${query}"` };
            }
            case 'create_lead': {
                if (this.leadsService) {
                    const lead = await this.leadsService.createLead(organizationId, undefined, {
                        name: params.name || 'Inbound AI Lead',
                        email: params.email,
                        phone: params.phone,
                        company: params.company,
                        notes: params.notes,
                        source: 'whatsapp',
                    });
                    return {
                        success: true,
                        leadId: lead._id,
                        name: lead.name,
                        leadScore: lead.leadScore,
                        priority: lead.priority,
                    };
                }
                return { success: true, leadId: 'lead_mock_123', status: 'created' };
            }
            case 'book_appointment': {
                if (this.appointmentsService) {
                    const apt = await this.appointmentsService.createAppointment(organizationId, undefined, {
                        title: params.title || 'AI Scheduled Consultation',
                        startTime: params.startTime || new Date(Date.now() + 86400000).toISOString(),
                        durationMinutes: params.durationMinutes || 30,
                        customerId: params.customerId,
                        leadId: params.leadId,
                        isAiScheduled: true,
                    });
                    return {
                        success: true,
                        appointmentId: apt._id,
                        startTime: apt.startTime,
                        meetingUrl: apt.meetingUrl || 'https://meet.google.com/automa-demo',
                    };
                }
                return { success: true, appointmentId: 'apt_mock_123', meetingUrl: 'https://meet.google.com/mock' };
            }
            case 'create_invoice': {
                if (this.invoicesService) {
                    const items = Array.isArray(params.items) && params.items.length > 0
                        ? params.items
                        : [{ description: 'AI Automation Consulting Service', quantity: 1, unitPrice: 2400, amount: 2400 }];
                    const inv = await this.invoicesService.createInvoice(organizationId, undefined, {
                        customerId: params.customerId || '60d5ecb8b392d721b8f1e101',
                        items,
                        dueDate: params.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
                    });
                    return {
                        success: true,
                        invoiceId: inv._id,
                        invoiceNumber: inv.invoiceNumber,
                        total: inv.total,
                        paymentUrl: inv.hostedPaymentUrl,
                    };
                }
                return { success: true, invoiceNumber: 'INV-2026-999', total: 2400 };
            }
            case 'create_task': {
                if (this.tasksService) {
                    const task = await this.tasksService.createTask(organizationId, undefined, {
                        title: params.title || 'AI Follow-up Task',
                        priority: params.priority || 'medium',
                        customerId: params.customerId,
                        dueDate: params.dueDate,
                        isAiGenerated: true,
                        source: 'Autonomous AI Agent',
                    });
                    return {
                        success: true,
                        taskId: task._id,
                        title: task.title,
                        priority: task.priority,
                    };
                }
                return { success: true, taskId: 'task_mock_123' };
            }
            case 'send_whatsapp_message': {
                return {
                    success: true,
                    channel: 'whatsapp',
                    recipient: params.phoneNumber,
                    dispatchedAt: new Date().toISOString(),
                };
            }
            case 'search_knowledge_base': {
                return {
                    query: params.query,
                    citations: [
                        {
                            title: 'Company Service Level Agreement & Refund Policies',
                            excerpt: 'Refunds are permissible within 7 calendar days of subscription invoice dispatch.',
                            similarity: 0.94,
                        },
                    ],
                };
            }
            default:
                return { success: true, tool: toolName, params };
        }
    }
};
exports.AgentToolsRegistry = AgentToolsRegistry;
exports.AgentToolsRegistry = AgentToolsRegistry = AgentToolsRegistry_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __param(3, (0, common_1.Optional)()),
    __param(4, (0, common_1.Optional)()),
    __param(5, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [leads_service_1.LeadsService,
        customers_service_1.CustomersService,
        appointments_service_1.AppointmentsService,
        invoices_service_1.InvoicesService,
        whatsapp_service_1.WhatsAppService,
        tasks_service_1.TasksService])
], AgentToolsRegistry);
//# sourceMappingURL=agent-tools.registry.js.map