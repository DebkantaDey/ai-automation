import {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  Types,
} from 'mongoose';
import { BaseTenantDocument } from './base-tenant.schema';
import { TenantContextService } from '../../tenancy/tenant-context.service';
import { NotFoundException } from '@nestjs/common';

export interface PaginationParams {
  page?: number;
  limit?: number;
  skip?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class BaseTenantRepository<T extends BaseTenantDocument> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Automatically attaches active tenant ID if not present in filter
   */
  protected getScopedFilter(filter: FilterQuery<T> = {}): FilterQuery<T> {
    const orgId = TenantContextService.getOrganizationId();
    const wsId = TenantContextService.getWorkspaceId();

    const scoped: FilterQuery<T> = { ...filter, isDeleted: filter.isDeleted ?? false };

    if (orgId && !scoped.organizationId) {
      scoped.organizationId = new Types.ObjectId(orgId);
    }
    if (wsId && !scoped.workspaceId) {
      scoped.workspaceId = new Types.ObjectId(wsId);
    }

    return scoped;
  }

  async create(data: Partial<T>): Promise<T> {
    const orgId = TenantContextService.getOrganizationId();
    const wsId = TenantContextService.getWorkspaceId();
    const userId = TenantContextService.getUserId();

    const entityData: any = {
      ...data,
      organizationId: data.organizationId || (orgId ? new Types.ObjectId(orgId) : undefined),
      workspaceId: data.workspaceId || (wsId ? new Types.ObjectId(wsId) : undefined),
      createdBy: data.createdBy || (userId ? new Types.ObjectId(userId) : undefined),
      updatedBy: data.updatedBy || (userId ? new Types.ObjectId(userId) : undefined),
    };

    const created = new this.model(entityData);
    return (await created.save()) as T;
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    const filter = this.getScopedFilter({ _id: new Types.ObjectId(id as any) } as FilterQuery<T>);
    return this.model.findOne(filter, projection, options).exec();
  }

  async findByIdOrThrow(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T> {
    const doc = await this.findById(id, projection, options);
    if (!doc) {
      throw new NotFoundException(`Resource with ID ${id} not found or access denied`);
    }
    return doc;
  }

  async findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOne(this.getScopedFilter(filter), projection, options).exec();
  }

  async findMany(
    filter: FilterQuery<T> = {},
    projection?: ProjectionType<T>,
    options?: QueryOptions<T>,
  ): Promise<T[]> {
    return this.model.find(this.getScopedFilter(filter), projection, options).exec();
  }

  async findPaginated(
    filter: FilterQuery<T> = {},
    pagination: PaginationParams = {},
    sort: Record<string, 1 | -1> = { createdAt: -1 },
    projection?: ProjectionType<T>,
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(100, Math.max(1, pagination.limit || 20));
    const skip = pagination.skip !== undefined ? pagination.skip : (page - 1) * limit;

    const scopedFilter = this.getScopedFilter(filter);

    const [data, total] = await Promise.all([
      this.model
        .find(scopedFilter, projection)
        .sort(sort as any)
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

  async updateById(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options: QueryOptions<T> = { new: true },
  ): Promise<T | null> {
    const filter = this.getScopedFilter({ _id: new Types.ObjectId(id as any) } as FilterQuery<T>);
    const userId = TenantContextService.getUserId();

    const updatePayload: any = {
      ...update,
      $set: {
        ...(update.$set || {}),
        ...(userId ? { updatedBy: new Types.ObjectId(userId) } : {}),
      },
    };

    return this.model.findOneAndUpdate(filter, updatePayload, options).exec();
  }

  async softDeleteById(id: string | Types.ObjectId): Promise<boolean> {
    const filter = this.getScopedFilter({ _id: new Types.ObjectId(id as any) } as FilterQuery<T>);
    const userId = TenantContextService.getUserId();

    const result = await this.model
      .updateOne(filter, {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          ...(userId ? { updatedBy: new Types.ObjectId(userId) } : {}),
        },
      } as any)
      .exec();

    return result.modifiedCount > 0;
  }

  async hardDeleteById(id: string | Types.ObjectId): Promise<boolean> {
    const filter = this.getScopedFilter({ _id: new Types.ObjectId(id as any) } as FilterQuery<T>);
    const result = await this.model.deleteOne(filter).exec();
    return result.deletedCount > 0;
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(this.getScopedFilter(filter)).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const res = await this.model.exists(this.getScopedFilter(filter));
    return !!res;
  }
}
