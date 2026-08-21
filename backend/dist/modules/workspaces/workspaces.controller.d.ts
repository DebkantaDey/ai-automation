import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';
export declare class WorkspacesController {
    private readonly workspacesService;
    constructor(workspacesService: WorkspacesService);
    create(orgId: string, userId: string, dto: CreateWorkspaceDto): Promise<import("./schemas/workspace.schema").WorkspaceDocument>;
    list(orgId: string): Promise<import("./schemas/workspace.schema").WorkspaceDocument[]>;
    getCurrent(orgId: string, workspaceId: string): Promise<import("./schemas/workspace.schema").WorkspaceDocument>;
    getBySlug(orgId: string, slug: string): Promise<import("./schemas/workspace.schema").WorkspaceDocument>;
    getById(orgId: string, id: string): Promise<import("./schemas/workspace.schema").WorkspaceDocument>;
    update(orgId: string, id: string, dto: UpdateWorkspaceDto): Promise<import("./schemas/workspace.schema").WorkspaceDocument>;
    archive(orgId: string, id: string): Promise<import("./schemas/workspace.schema").WorkspaceDocument>;
    delete(orgId: string, id: string): Promise<boolean>;
}
