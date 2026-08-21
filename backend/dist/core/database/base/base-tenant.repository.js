"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTenantRepository = void 0;
const mongoose_1 = require("mongoose");
const tenant_context_service_1 = require("../../tenancy/tenant-context.service");
const common_1 = require("@nestjs/common");
class BaseTenantRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    getScopedFilter(filter = {}) {
        const orgId = tenant_context_service_1.TenantContextService.getOrganizationId();
        const wsId = tenant_context_service_1.TenantContextService.getWorkspaceId();
        const scoped = { ...filter, isDeleted: filter.isDeleted ?? false };
        if (orgId && !scoped.organizationId) {
            scoped.organizationId = new mongoose_1.Types.ObjectId(orgId);
        }
        if (wsId && !scoped.workspaceId) {
            scoped.workspaceId = new mongoose_1.Types.ObjectId(wsId);
        }
        return scoped;
    }
    async create(data) {
        const orgId = tenant_context_service_1.TenantContextService.getOrganizationId();
        const wsId = tenant_context_service_1.TenantContextService.getWorkspaceId();
        const userId = tenant_context_service_1.TenantContextService.getUserId();
        const entityData = {
            ...data,
            organizationId: data.organizationId || (orgId ? new mongoose_1.Types.ObjectId(orgId) : undefined),
            workspaceId: data.workspaceId || (wsId ? new mongoose_1.Types.ObjectId(wsId) : undefined),
            createdBy: data.createdBy || (userId ? new mongoose_1.Types.ObjectId(userId) : undefined),
            updatedBy: data.updatedBy || (userId ? new mongoose_1.Types.ObjectId(userId) : undefined),
        };
        const created = new this.model(entityData);
        return (await created.save());
    }
    async findById(id, projection, options) {
        const filter = this.getScopedFilter({ _id: new mongoose_1.Types.ObjectId(id) });
        return this.model.findOne(filter, projection, options).exec();
    }
    async findByIdOrThrow(id, projection, options) {
        const doc = await this.findById(id, projection, options);
        if (!doc) {
            throw new common_1.NotFoundException(`Resource with ID ${id} not found or access denied`);
        }
        return doc;
    }
    async findOne(filter, projection, options) {
        return this.model.findOne(this.getScopedFilter(filter), projection, options).exec();
    }
    async findMany(filter = {}, projection, options) {
        return this.model.find(this.getScopedFilter(filter), projection, options).exec();
    }
    async findPaginated(filter = {}, pagination = {}, sort = { createdAt: -1 }, projection) {
        const page = Math.max(1, pagination.page || 1);
        const limit = Math.min(100, Math.max(1, pagination.limit || 20));
        const skip = pagination.skip !== undefined ? pagination.skip : (page - 1) * limit;
        const scopedFilter = this.getScopedFilter(filter);
        const [data, total] = await Promise.all([
            this.model
                .find(scopedFilter, projection)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.model.countDocuments(scopedFilter).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async updateById(id, update, options = { new: true }) {
        const filter = this.getScopedFilter({ _id: new mongoose_1.Types.ObjectId(id) });
        const userId = tenant_context_service_1.TenantContextService.getUserId();
        const updatePayload = {
            ...update,
            $set: {
                ...(update.$set || {}),
                ...(userId ? { updatedBy: new mongoose_1.Types.ObjectId(userId) } : {}),
            },
        };
        return this.model.findOneAndUpdate(filter, updatePayload, options).exec();
    }
    async softDeleteById(id) {
        const filter = this.getScopedFilter({ _id: new mongoose_1.Types.ObjectId(id) });
        const userId = tenant_context_service_1.TenantContextService.getUserId();
        const result = await this.model
            .updateOne(filter, {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
                ...(userId ? { updatedBy: new mongoose_1.Types.ObjectId(userId) } : {}),
            },
        })
            .exec();
        return result.modifiedCount > 0;
    }
    async hardDeleteById(id) {
        const filter = this.getScopedFilter({ _id: new mongoose_1.Types.ObjectId(id) });
        const result = await this.model.deleteOne(filter).exec();
        return result.deletedCount > 0;
    }
    async count(filter = {}) {
        return this.model.countDocuments(this.getScopedFilter(filter)).exec();
    }
    async exists(filter) {
        const res = await this.model.exists(this.getScopedFilter(filter));
        return !!res;
    }
}
exports.BaseTenantRepository = BaseTenantRepository;
//# sourceMappingURL=base-tenant.repository.js.map