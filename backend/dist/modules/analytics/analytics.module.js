"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
const workflow_schema_1 = require("../workflows/schemas/workflow.schema");
const workflow_execution_schema_1 = require("../workflows/schemas/workflow-execution.schema");
const usage_record_schema_1 = require("../billing/schemas/usage-record.schema");
const billing_module_1 = require("../billing/billing.module");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: workflow_schema_1.Workflow.name, schema: workflow_schema_1.WorkflowSchema },
                { name: workflow_execution_schema_1.WorkflowExecution.name, schema: workflow_execution_schema_1.WorkflowExecutionSchema },
                { name: usage_record_schema_1.UsageRecord.name, schema: usage_record_schema_1.UsageRecordSchema },
            ]),
            billing_module_1.BillingModule,
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map