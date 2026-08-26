"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const agents_controller_1 = require("./agents.controller");
const approvals_controller_1 = require("./controllers/approvals.controller");
const agents_service_1 = require("./agents.service");
const agent_engine_service_1 = require("./engine/agent-engine.service");
const approvals_service_1 = require("./services/approvals.service");
const agent_tools_registry_1 = require("./tools/agent-tools.registry");
const agent_schema_1 = require("./schemas/agent.schema");
const agent_execution_schema_1 = require("./schemas/agent-execution.schema");
const approval_request_schema_1 = require("./schemas/approval-request.schema");
const ai_module_1 = require("../../integrations/ai/ai.module");
const integrations_module_1 = require("../integrations/integrations.module");
const events_module_1 = require("../../core/events/events.module");
const crm_module_1 = require("../crm/crm.module");
const calendar_module_1 = require("../calendar/calendar.module");
const invoices_module_1 = require("../invoices/invoices.module");
const tasks_module_1 = require("../tasks/tasks.module");
const inbox_module_1 = require("../inbox/inbox.module");
let AgentsModule = class AgentsModule {
};
exports.AgentsModule = AgentsModule;
exports.AgentsModule = AgentsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: agent_schema_1.Agent.name, schema: agent_schema_1.AgentSchema },
                { name: agent_execution_schema_1.AgentExecution.name, schema: agent_execution_schema_1.AgentExecutionSchema },
                { name: approval_request_schema_1.ApprovalRequest.name, schema: approval_request_schema_1.ApprovalRequestSchema },
            ]),
            ai_module_1.AiModule,
            integrations_module_1.IntegrationsModule,
            events_module_1.EventsModule,
            (0, common_1.forwardRef)(() => crm_module_1.CrmModule),
            (0, common_1.forwardRef)(() => calendar_module_1.CalendarModule),
            (0, common_1.forwardRef)(() => invoices_module_1.InvoicesModule),
            (0, common_1.forwardRef)(() => tasks_module_1.TasksModule),
            (0, common_1.forwardRef)(() => inbox_module_1.InboxModule),
        ],
        controllers: [agents_controller_1.AgentsController, approvals_controller_1.ApprovalsController],
        providers: [
            agents_service_1.AgentsService,
            agent_engine_service_1.AgentEngineService,
            approvals_service_1.ApprovalsService,
            agent_tools_registry_1.AgentToolsRegistry,
        ],
        exports: [
            agents_service_1.AgentsService,
            agent_engine_service_1.AgentEngineService,
            approvals_service_1.ApprovalsService,
            agent_tools_registry_1.AgentToolsRegistry,
            mongoose_1.MongooseModule,
        ],
    })
], AgentsModule);
//# sourceMappingURL=agents.module.js.map