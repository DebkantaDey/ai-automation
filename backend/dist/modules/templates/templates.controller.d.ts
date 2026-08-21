import { TemplatesService } from './templates.service';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    listTemplates(): import("./templates.constants").WorkflowTemplate[];
    getTemplateBySlug(slug: string): import("./templates.constants").WorkflowTemplate;
    cloneTemplate(slug: string, orgId: string, wsId: string, userId: string, customName?: string): Promise<import("../workflows/schemas/workflow.schema").WorkflowDocument>;
}
