"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenancyModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const mongoose_1 = require("@nestjs/mongoose");
const tenant_context_service_1 = require("./tenant-context.service");
const tenant_interceptor_1 = require("./tenant.interceptor");
const tenant_guard_1 = require("./tenant.guard");
const organization_member_schema_1 = require("../../modules/organizations/schemas/organization-member.schema");
let TenancyModule = class TenancyModule {
};
exports.TenancyModule = TenancyModule;
exports.TenancyModule = TenancyModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: organization_member_schema_1.OrganizationMember.name, schema: organization_member_schema_1.OrganizationMemberSchema },
            ]),
        ],
        providers: [
            tenant_context_service_1.TenantContextService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: tenant_interceptor_1.TenantInterceptor,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: tenant_guard_1.TenantGuard,
            },
        ],
        exports: [tenant_context_service_1.TenantContextService, mongoose_1.MongooseModule],
    })
], TenancyModule);
//# sourceMappingURL=tenancy.module.js.map