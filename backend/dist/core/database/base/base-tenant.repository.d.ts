import { FilterQuery, Model, ProjectionType, QueryOptions, UpdateQuery, Types } from 'mongoose';
import { BaseTenantDocument } from './base-tenant.schema';
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
export declare abstract class BaseTenantRepository<T extends BaseTenantDocument> {
    protected readonly model: Model<T>;
    constructor(model: Model<T>);
    protected getScopedFilter(filter?: FilterQuery<T>): FilterQuery<T>;
    create(data: Partial<T>): Promise<T>;
    findById(id: string | Types.ObjectId, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null>;
    findByIdOrThrow(id: string | Types.ObjectId, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T>;
    findOne(filter: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T | null>;
    findMany(filter?: FilterQuery<T>, projection?: ProjectionType<T>, options?: QueryOptions<T>): Promise<T[]>;
    findPaginated(filter?: FilterQuery<T>, pagination?: PaginationParams, sort?: Record<string, 1 | -1>, projection?: ProjectionType<T>): Promise<PaginatedResult<T>>;
    updateById(id: string | Types.ObjectId, update: UpdateQuery<T>, options?: QueryOptions<T>): Promise<T | null>;
    softDeleteById(id: string | Types.ObjectId): Promise<boolean>;
    hardDeleteById(id: string | Types.ObjectId): Promise<boolean>;
    count(filter?: FilterQuery<T>): Promise<number>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
}
