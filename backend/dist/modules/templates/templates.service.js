"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplatesService = void 0;
const common_1 = require("@nestjs/common");
const templates_constants_1 = require("./templates.constants");
const workflows_service_1 = require("../workflows/workflows.service");
let TemplatesService = class TemplatesService {
    workflowsService;
    constructor(workflowsService) {
        this.workflowsService = workflowsService;
    }
    listTemplates() {
        return templates_constants_1.WORKFLOW_TEMPLATES;
    }
    getTemplateBySlug(slug) {
        const template = templates_constants_1.WORKFLOW_TEMPLATES.find((t) => t.slug === slug);
        if (!template) {
            throw new common_1.NotFoundException(`Template with slug '${slug}' not found`);
        }
        return template;
    }
    async cloneTemplate(slug, organizationId, workspaceId, userId, customName) {
        const template = this.getTemplateBySlug(slug);
        return this.workflowsService.create(organizationId, workspaceId, userId, {
            name: customName || template.name,
            description: template.description,
            triggerType: template.triggerType,
            nodes: template.nodes,
            edges: template.edges,
        });
    }
};
exports.TemplatesService = TemplatesService;
exports.TemplatesService = TemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [workflows_service_1.WorkflowsService])
], TemplatesService);
//# sourceMappingURL=templates.service.js.map