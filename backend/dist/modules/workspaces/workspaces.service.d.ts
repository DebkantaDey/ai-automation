import { Model } from 'mongoose';
import { WorkspaceDocument } from './schemas/workspace.schema';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';
export declare class WorkspacesService {
    private readonly workspaceModel;
    private readonly logger;
    constructor(workspaceModel: Model<WorkspaceDocument>);
    private toObjectId;
    private slugify;
    create(organizationId: string, userId: string, dto: CreateWorkspaceDto): Promise<WorkspaceDocument>;
    ensureDefaultWorkspace(organizationId: string, userId?: string): Promise<WorkspaceDocument>;
    listByOrganization(organizationId: string): Promise<WorkspaceDocument[]>;
    findById(workspaceId: string, organizationId?: string): Promise<WorkspaceDocument>;
    findBySlug(organizationId: string, slug: string): Promise<WorkspaceDocument>;
    getCurrent(organizationId: string, workspaceId?: string): Promise<WorkspaceDocument>;
    update(workspaceId: string, organizationId: string, dto: UpdateWorkspaceDto): Promise<WorkspaceDocument>;
    archive(workspaceId: string, organizationId: string): Promise<WorkspaceDocument>;
    delete(workspaceId: string, organizationId: string): Promise<boolean>;
}
