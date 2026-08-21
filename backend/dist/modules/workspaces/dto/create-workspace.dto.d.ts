export declare class CreateWorkspaceDto {
    name: string;
    slug?: string;
    description?: string;
    color?: string;
    icon?: string;
    timezone?: string;
    settings?: Record<string, any>;
}
export declare class UpdateWorkspaceDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    timezone?: string;
    status?: 'active' | 'archived' | 'suspended';
    settings?: Record<string, any>;
}
