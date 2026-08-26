"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditPlugin = auditPlugin;
const mongoose_1 = require("mongoose");
const tenant_context_service_1 = require("../../tenancy/tenant-context.service");
function auditPlugin(schema) {
    if (!schema.path('isDeleted')) {
        schema.add({
            isDeleted: {
                type: Boolean,
                default: false,
                index: true,
            },
        });
    }
    if (!schema.path('deletedAt')) {
        schema.add({
            deletedAt: {
                type: Date,
                default: null,
            },
        });
    }
    if (!schema.path('createdBy')) {
        schema.add({
            createdBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
        });
    }
    if (!schema.path('updatedBy')) {
        schema.add({
            updatedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                default: null,
            },
        });
    }
    schema.pre('save', function (next) {
        if (typeof this.get !== 'function') {
            return next();
        }
        const userId = tenant_context_service_1.TenantContextService.getUserId();
        if (this.isNew && userId && !this.get('createdBy')) {
            this.set('createdBy', userId);
        }
        if (userId) {
            this.set('updatedBy', userId);
        }
        next();
    });
}
//# sourceMappingURL=audit.plugin.js.map