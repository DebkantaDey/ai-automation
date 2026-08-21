"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenancyPlugin = tenancyPlugin;
const mongoose_1 = require("mongoose");
const tenant_context_service_1 = require("../../tenancy/tenant-context.service");
function tenancyPlugin(schema, options = {}) {
    if (!schema.path('organizationId')) {
        schema.add({
            organizationId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Organization',
                required: true,
                index: true,
            },
        });
    }
    if (!schema.path('workspaceId')) {
        schema.add({
            workspaceId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Workspace',
                required: !!options.requireWorkspace,
                index: true,
            },
        });
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
            if (options.requireWorkspace) {
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