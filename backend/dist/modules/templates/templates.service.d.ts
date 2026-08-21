import { WorkflowTemplate } from './templates.constants';
import { WorkflowsService } from '../workflows/workflows.service';
export declare class TemplatesService {
    private readonly workflowsService;
    constructor(workflowsService: WorkflowsService);
    listTemplates(): WorkflowTemplate[];
    getTemplateBySlug(slug: string): WorkflowTemplate;
    cloneTemplate(slug: string, organizationId: string, workspaceId: string, userId: string, customName?: string): Promise<import("../workflows/schemas/workflow.schema").WorkflowDocument>;
}
