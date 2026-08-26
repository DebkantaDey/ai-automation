"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenancyPlugin = tenancyPlugin;
const tenant_context_service_1 = require("../../tenancy/tenant-context.service");
function tenancyPlugin(schema, options = {}) {
    if (!schema.path('organizationId')) {
        return;
    }
    const queryMethods = [
        'countDocuments',
        'find',
        'findOne',
        'findOneAndDelete',
        'findOneAndReplace',
        'findOneAndUpdate',
        'updateMany',
        'updateOne',
        'deleteMany',
        'deleteOne',
    ];
    queryMethods.forEach((method) => {
        schema.pre(method, function () {
            const queryOptions = this.getOptions();
            if (queryOptions && queryOptions.skipTenantFilter) {
                return;
            }
            const orgId = tenant_context_service_1.TenantContextService.getOrganizationId();
            if (orgId) {
                this.where({ organizationId: orgId });
            }
            if ((options.requireWorkspace || schema.path('workspaceId')) && tenant_context_service_1.TenantContextService.getWorkspaceId()) {
                const wsId = tenant_context_service_1.TenantContextService.getWorkspaceId();
                if (wsId) {
                    this.where({ workspaceId: wsId });
                }
            }
        });
    });
    schema.pre('aggregate', function () {
        const pipeline = this.pipeline();
        const orgId = tenant_context_service_1.TenantContextService.getOrganizationId();
        if (orgId) {
            const matchStage = pipeline.find((stage) => stage.$match);
            if (matchStage && matchStage.$match) {
                if (!matchStage.$match.organizationId) {
                    matchStage.$match.organizationId = orgId;
                }
            }
            else {
                pipeline.unshift({ $match: { organizationId: orgId } });
            }
        }
    });
}
//# sourceMappingURL=tenancy.plugin.js.map