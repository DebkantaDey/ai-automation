"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkspacesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspacesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const workspace_schema_1 = require("./schemas/workspace.schema");
let WorkspacesService = WorkspacesService_1 = class WorkspacesService {
    workspaceModel;
    logger = new common_1.Logger(WorkspacesService_1.name);
    constructor(workspaceModel) {
        this.workspaceModel = workspaceModel;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async create(organizationId, userId, dto) {
        const baseSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
        let slug = baseSlug;
        let counter = 1;
        while (await this.workspaceModel.findOne({
            organizationId: this.toObjectId(organizationId),
            slug,
            isDeleted: false,
        })) {
            slug = `${baseSlug}-${counter++}`;
        }
        const workspace = new this.workspaceModel({
            organizationId: this.toObjectId(organizationId),
            name: dto.name,
            slug,
            description: dto.description || '',
            color: dto.color || '#3B82F6',
            icon: dto.icon || 'Layers',
            timezone: dto.timezone || 'UTC',
            settings: dto.settings || {},
            createdBy: this.toObjectId(userId),
            isDefault: false,
            status: 'active',
        });
        return workspace.save();
    }
    async ensureDefaultWorkspace(organizationId, userId) {
        const existing = await this.workspaceModel.findOne({
            organizationId: this.toObjectId(organizationId),
            isDefault: true,
            isDeleted: false,
        });
        if (existing) {
            return existing;
        }
        const defaultWs = new this.workspaceModel({
            organizationId: this.toObjectId(organizationId),
            name: 'Default Workspace',
            slug: 'default',
            description: 'Default production automation workspace',
            color: '#3B82F6',
            icon: 'Layers',
            isDefault: true,
            status: 'active',
            createdBy: userId ? this.toObjectId(userId) : null,
        });
        return defaultWs.save();
    }
    async listByOrganization(organizationId) {
        return this.workspaceModel
            .find({
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .sort({ isDefault: -1, createdAt: 1 })
            .exec();
    }
    async findById(workspaceId, organizationId) {
        const filter = { _id: this.toObjectId(workspaceId), isDeleted: false };
        if (organizationId) {
            filter.organizationId = this.toObjectId(organizationId);
        }
        const ws = await this.workspaceModel.findOne(filter);
        if (!ws) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        return ws;
    }
    async findBySlug(organizationId, slug) {
        const ws = await this.workspaceModel.findOne({
            organizationId: this.toObjectId(organizationId),
            slug: slug.toLowerCase(),
            isDeleted: false,
        });
        if (!ws) {
            throw new common_1.NotFoundException(`Workspace with slug '${slug}' not found`);
        }
        return ws;
    }
    async getCurrent(organizationId, workspaceId) {
        if (workspaceId) {
            const ws = await this.workspaceModel.findOne({
                _id: this.toObjectId(workspaceId),
                organizationId: this.toObjectId(organizationId),
                isDeleted: false,
            });
            if (ws)
                return ws;
        }
        const defaultWs = await this.workspaceModel.findOne({
            organizationId: this.toObjectId(organizationId),
            isDefault: true,
            isDeleted: false,
        });
        if (defaultWs)
            return defaultWs;
        return this.ensureDefaultWorkspace(organizationId);
    }
    async update(workspaceId, organizationId, dto) {
        const ws = await this.findById(workspaceId, organizationId);
        if (dto.name !== undefined)
            ws.name = dto.name;
        if (dto.description !== undefined)
            ws.description = dto.description;
        if (dto.color !== undefined)
            ws.color = dto.color;
        if (dto.icon !== undefined)
            ws.icon = dto.icon;
        if (dto.timezone !== undefined)
            ws.timezone = dto.timezone;
        if (dto.status !== undefined)
            ws.status = dto.status;
        if (dto.settings !== undefined)
            ws.settings = { ...ws.settings, ...dto.settings };
        await ws.save();
        return ws;
    }
    async archive(workspaceId, organizationId) {
        const ws = await this.findById(workspaceId, organizationId);
        if (ws.isDefault) {
            throw new common_1.BadRequestException('Cannot archive the default workspace of an organization');
        }
        ws.status = 'archived';
        await ws.save();
        return ws;
    }
    async delete(workspaceId, organizationId) {
        const ws = await this.findById(workspaceId, organizationId);
        if (ws.isDefault) {
            throw new common_1.BadRequestException('Cannot delete the default workspace of an organization');
        }
        ws.isDeleted = true;
        ws.deletedAt = new Date();
        await ws.save();
        return true;
    }
};
exports.WorkspacesService = WorkspacesService;
exports.WorkspacesService = WorkspacesService = WorkspacesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(workspace_schema_1.Workspace.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WorkspacesService);
//# sourceMappingURL=workspaces.service.js.map