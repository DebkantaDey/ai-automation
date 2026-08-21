"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const config_2 = require("../core/config");
const database_module_1 = require("../core/database/database.module");
const tenancy_module_1 = require("../core/tenancy/tenancy.module");
const queue_module_1 = require("../core/queue/queue.module");
const ai_module_1 = require("../integrations/ai/ai.module");
const storage_module_1 = require("../integrations/storage/storage.module");
const billing_module_1 = require("../integrations/billing/billing.module");
const mongoose_1 = require("@nestjs/mongoose");
const workflow_execution_schema_1 = require("../modules/workflows/schemas/workflow-execution.schema");
const workflow_schema_1 = require("../modules/workflows/schemas/workflow.schema");
const workflow_execution_processor_1 = require("./processors/workflow-execution.processor");
const ai_task_processor_1 = require("./processors/ai-task.processor");
let WorkerModule = class WorkerModule {
};
exports.WorkerModule = WorkerModule;
exports.WorkerModule = WorkerModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: config_2.appConfigurations,
                envFilePath: ['.env.local', '.env'],
            }),
            database_module_1.DatabaseModule,
            tenancy_module_1.TenancyModule,
            queue_module_1.QueueModule,
            ai_module_1.AiModule,
            storage_module_1.StorageModule,
            billing_module_1.BillingModule,
            mongoose_1.MongooseModule.forFeature([
                { name: workflow_execution_schema_1.WorkflowExecution.name, schema: workflow_execution_schema_1.WorkflowExecutionSchema },
                { name: workflow_schema_1.Workflow.name, schema: workflow_schema_1.WorkflowSchema },
            ]),
        ],
        providers: [workflow_execution_processor_1.WorkflowExecutionProcessor, ai_task_processor_1.AiTaskProcessor],
    })
], WorkerModule);
//# sourceMappingURL=worker.module.js.map