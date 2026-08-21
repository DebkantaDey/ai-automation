"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const workflows_controller_1 = require("./workflows.controller");
const workflows_service_1 = require("./workflows.service");
const workflow_engine_service_1 = require("./engine/workflow-engine.service");
const workflow_execution_processor_1 = require("./processors/workflow-execution.processor");
const workflow_schema_1 = require("./schemas/workflow.schema");
const workflow_version_schema_1 = require("./schemas/workflow-version.schema");
const workflow_execution_schema_1 = require("./schemas/workflow-execution.schema");
const queue_constants_1 = require("../../core/queue/queue.constants");
const ai_module_1 = require("../../integrations/ai/ai.module");
const events_module_1 = require("../../core/events/events.module");
const integrations_module_1 = require("../integrations/integrations.module");
let WorkflowsModule = class WorkflowsModule {
};
exports.WorkflowsModule = WorkflowsModule;
exports.WorkflowsModule = WorkflowsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: workflow_schema_1.Workflow.name, schema: workflow_schema_1.WorkflowSchema },
                { name: workflow_version_schema_1.WorkflowVersion.name, schema: workflow_version_schema_1.WorkflowVersionSchema },
                { name: workflow_execution_schema_1.WorkflowExecution.name, schema: workflow_execution_schema_1.WorkflowExecutionSchema },
            ]),
            bullmq_1.BullModule.registerQueue({
                name: queue_constants_1.QUEUE_WORKFLOW_EXECUTION,
            }),
            ai_module_1.AiModule,
            events_module_1.EventsModule,
            integrations_module_1.IntegrationsModule,
        ],
        controllers: [workflows_controller_1.WorkflowsController],
        providers: [workflows_service_1.WorkflowsService, workflow_engine_service_1.WorkflowEngineService, workflow_execution_processor_1.WorkflowExecutionProcessor],
        exports: [workflows_service_1.WorkflowsService, workflow_engine_service_1.WorkflowEngineService, mongoose_1.MongooseModule],
    })
], WorkflowsModule);
//# sourceMappingURL=workflows.module.js.map