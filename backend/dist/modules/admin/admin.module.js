"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const super_admin_guard_1 = require("./guards/super-admin.guard");
const user_schema_1 = require("../users/schemas/user.schema");
const organization_schema_1 = require("../organizations/schemas/organization.schema");
const subscription_schema_1 = require("../billing/schemas/subscription.schema");
const workflow_schema_1 = require("../workflows/schemas/workflow.schema");
const workflow_execution_schema_1 = require("../workflows/schemas/workflow-execution.schema");
const audit_log_schema_1 = require("../audit-logs/schemas/audit-log.schema");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
                { name: organization_schema_1.Organization.name, schema: organization_schema_1.OrganizationSchema },
                { name: subscription_schema_1.Subscription.name, schema: subscription_schema_1.SubscriptionSchema },
                { name: workflow_schema_1.Workflow.name, schema: workflow_schema_1.WorkflowSchema },
                { name: workflow_execution_schema_1.WorkflowExecution.name, schema: workflow_execution_schema_1.WorkflowExecutionSchema },
                { name: audit_log_schema_1.AuditLog.name, schema: audit_log_schema_1.AuditLogSchema },
            ]),
        ],
        controllers: [admin_controller_1.AdminController],
        providers: [admin_service_1.AdminService, super_admin_guard_1.SuperAdminGuard],
        exports: [admin_service_1.AdminService, super_admin_guard_1.SuperAdminGuard],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map