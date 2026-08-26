"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesModule = void 0;
const common_1 = require("@nestjs/common");
const templates_controller_1 = require("./templates.controller");
const templates_service_1 = require("./templates.service");
const workflows_module_1 = require("../workflows/workflows.module");
const agents_module_1 = require("../agents/agents.module");
const crm_module_1 = require("../crm/crm.module");
const invoices_module_1 = require("../invoices/invoices.module");
const events_module_1 = require("../../core/events/events.module");
let TemplatesModule = class TemplatesModule {
};
exports.TemplatesModule = TemplatesModule;
exports.TemplatesModule = TemplatesModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            workflows_module_1.WorkflowsModule,
            (0, common_1.forwardRef)(() => agents_module_1.AgentsModule),
            (0, common_1.forwardRef)(() => crm_module_1.CrmModule),
            (0, common_1.forwardRef)(() => invoices_module_1.InvoicesModule),
            events_module_1.EventsModule,
        ],
        controllers: [templates_controller_1.TemplatesController],
        providers: [templates_service_1.TemplatesService],
        exports: [templates_service_1.TemplatesService],
    })
], TemplatesModule);
//# sourceMappingURL=templates.module.js.map