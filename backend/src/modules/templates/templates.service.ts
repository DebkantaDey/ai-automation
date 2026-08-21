import { Injectable, NotFoundException } from '@nestjs/common';
import { WORKFLOW_TEMPLATES, WorkflowTemplate } from './templates.constants';
import { WorkflowsService } from '../workflows/workflows.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly workflowsService: WorkflowsService) {}

  listTemplates(): WorkflowTemplate[] {
    return WORKFLOW_TEMPLATES;
  }

  getTemplateBySlug(slug: string): WorkflowTemplate {
    const template = WORKFLOW_TEMPLATES.find((t) => t.slug === slug);
    if (!template) {
      throw new NotFoundException(`Template with slug '${slug}' not found`);
    }
    return template;
  }

  async cloneTemplate(
    slug: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    customName?: string,
  ) {
    const template = this.getTemplateBySlug(slug);

    return this.workflowsService.create(organizationId, workspaceId, userId, {
      name: customName || template.name,
      description: template.description,
      triggerType: template.triggerType,
      nodes: template.nodes,
      edges: template.edges,
    });
  }
}
