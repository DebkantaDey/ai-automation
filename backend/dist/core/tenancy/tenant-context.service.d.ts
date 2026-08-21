import { TenantContext } from './tenant-context.interface';
export declare class TenantContextService {
    private static readonly storage;
    static run<R>(context: TenantContext, callback: () => R): R;
    static getContext(): TenantContext | undefined;
    static getOrganizationId(): string | undefined;
    static getWorkspaceId(): string | undefined;
    static getUserId(): string | undefined;
    static setContext(updates: Partial<TenantContext>): void;
    getContext(): TenantContext | undefined;
    getOrganizationId(): string | undefined;
    getWorkspaceId(): string | undefined;
    getUserId(): string | undefined;
}
