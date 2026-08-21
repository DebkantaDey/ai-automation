import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace, WorkspaceDocument } from './schemas/workspace.schema';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    @InjectModel(Workspace.name) private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async create(
    organizationId: string,
    userId: string,
    dto: CreateWorkspaceDto,
  ): Promise<WorkspaceDocument> {
    const baseSlug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);
    let slug = baseSlug;
    let counter = 1;

    while (
      await this.workspaceModel.findOne({
        organizationId: this.toObjectId(organizationId),
        slug,
        isDeleted: false,
      })
    ) {
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

  async ensureDefaultWorkspace(
    organizationId: string,
    userId?: string,
  ): Promise<WorkspaceDocument> {
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

  async listByOrganization(organizationId: string): Promise<WorkspaceDocument[]> {
    return this.workspaceModel
      .find({
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .sort({ isDefault: -1, createdAt: 1 })
      .exec();
  }

  async findById(workspaceId: string, organizationId?: string): Promise<WorkspaceDocument> {
    const filter: any = { _id: this.toObjectId(workspaceId), isDeleted: false };
    if (organizationId) {
      filter.organizationId = this.toObjectId(organizationId);
    }
    const ws = await this.workspaceModel.findOne(filter);
    if (!ws) {
      throw new NotFoundException('Workspace not found');
    }
    return ws;
  }

  async findBySlug(organizationId: string, slug: string): Promise<WorkspaceDocument> {
    const ws = await this.workspaceModel.findOne({
      organizationId: this.toObjectId(organizationId),
      slug: slug.toLowerCase(),
      isDeleted: false,
    });
    if (!ws) {
      throw new NotFoundException(`Workspace with slug '${slug}' not found`);
    }
    return ws;
  }

  async getCurrent(organizationId: string, workspaceId?: string): Promise<WorkspaceDocument> {
    if (workspaceId) {
      const ws = await this.workspaceModel.findOne({
        _id: this.toObjectId(workspaceId),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      });
      if (ws) return ws;
    }

    // Fallback to default workspace
    const defaultWs = await this.workspaceModel.findOne({
      organizationId: this.toObjectId(organizationId),
      isDefault: true,
      isDeleted: false,
    });

    if (defaultWs) return defaultWs;

    // Create default workspace if none found
    return this.ensureDefaultWorkspace(organizationId);
  }

  async update(
    workspaceId: string,
    organizationId: string,
    dto: UpdateWorkspaceDto,
  ): Promise<WorkspaceDocument> {
    const ws = await this.findById(workspaceId, organizationId);

    if (dto.name !== undefined) ws.name = dto.name;
    if (dto.description !== undefined) ws.description = dto.description;
    if (dto.color !== undefined) ws.color = dto.color;
    if (dto.icon !== undefined) ws.icon = dto.icon;
    if (dto.timezone !== undefined) ws.timezone = dto.timezone;
    if (dto.status !== undefined) ws.status = dto.status;
    if (dto.settings !== undefined) ws.settings = { ...ws.settings, ...dto.settings };

    await ws.save();
    return ws;
  }

  async archive(workspaceId: string, organizationId: string): Promise<WorkspaceDocument> {
    const ws = await this.findById(workspaceId, organizationId);
    if (ws.isDefault) {
      throw new BadRequestException('Cannot archive the default workspace of an organization');
    }

    ws.status = 'archived';
    await ws.save();
    return ws;
  }

  async delete(workspaceId: string, organizationId: string): Promise<boolean> {
    const ws = await this.findById(workspaceId, organizationId);
    if (ws.isDefault) {
      throw new BadRequestException('Cannot delete the default workspace of an organization');
    }

    ws.isDeleted = true;
    ws.deletedAt = new Date();
    await ws.save();
    return true;
  }
}
