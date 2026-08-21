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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WorkflowsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const crypto = require("crypto");
const workflow_schema_1 = require("./schemas/workflow.schema");
const workflow_version_schema_1 = require("./schemas/workflow-version.schema");
const workflow_execution_schema_1 = require("./schemas/workflow-execution.schema");
const workflow_engine_service_1 = require("./engine/workflow-engine.service");
const subscription_access_service_1 = require("../billing/services/subscription-access.service");
const ai_gateway_service_1 = require("../../integrations/ai/ai-gateway.service");
const queue_constants_1 = require("../../core/queue/queue.constants");
let WorkflowsService = WorkflowsService_1 = class WorkflowsService {
    workflowModel;
    versionModel;
    executionModel;
    executionQueue;
    workflowEngine;
    aiGateway;
    subscriptionAccess;
    usageService;
    logger = new common_1.Logger(WorkflowsService_1.name);
    constructor(workflowModel, versionModel, executionModel, executionQueue, workflowEngine, aiGateway, subscriptionAccess, usageService) {
        this.workflowModel = workflowModel;
        this.versionModel = versionModel;
        this.executionModel = executionModel;
        this.executionQueue = executionQueue;
        this.workflowEngine = workflowEngine;
        this.aiGateway = aiGateway;
        this.subscriptionAccess = subscriptionAccess;
        this.usageService = usageService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async create(organizationId, workspaceId, userId, dto) {
        if (this.subscriptionAccess) {
            const currentCount = await this.workflowModel.countDocuments({
                organizationId: this.toObjectId(organizationId),
                isDeleted: false,
            });
            await this.subscriptionAccess.canCreateWorkflow(organizationId, currentCount);
        }
        const webhookId = dto.triggerType === 'webhook' ? `wh_${crypto.randomBytes(16).toString('hex')}` : undefined;
        const workflow = new this.workflowModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            name: dto.name,
            description: dto.description || '',
            triggerType: dto.triggerType || 'manual',
            triggerConfig: dto.triggerConfig || {},
            webhookId,
            nodes: dto.nodes || [
                {
                    id: 'trigger-1',
                    type: 'trigger',
                    label: 'Manual Trigger',
                    position: { x: 250, y: 100 },
                    data: { triggerType: 'manual' },
                },
            ],
            edges: dto.edges || [],
            status: 'draft',
            createdBy: this.toObjectId(userId),
        });
        return workflow.save();
    }
    async list(organizationId, workspaceId, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            isDeleted: false,
        };
        if (pagination.search) {
            filter.name = { $regex: pagination.search, $options: 'i' };
        }
        const [data, total] = await Promise.all([
            this.workflowModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec(),
            this.workflowModel.countDocuments(filter).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async findById(workflowId, organizationId, workspaceId) {
        const wf = await this.workflowModel.findOne({
            _id: this.toObjectId(workflowId),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            isDeleted: false,
        });
        if (!wf) {
            throw new common_1.NotFoundException('Workflow not found');
        }
        return wf;
    }
    async update(workflowId, organizationId, workspaceId, updates) {
        const wf = await this.workflowModel.findOneAndUpdate({
            _id: this.toObjectId(workflowId),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            isDeleted: false,
        }, { $set: updates, $inc: { version: 1 } }, { new: true });
        if (!wf) {
            throw new common_1.NotFoundException('Workflow not found');
        }
        return wf;
    }
    async updateStatus(workflowId, organizationId, workspaceId, status) {
        return this.update(workflowId, organizationId, workspaceId, { status });
    }
    async publish(workflowId, organizationId, workspaceId, userId, changelog = 'Published version') {
        const wf = await this.findById(workflowId, organizationId, workspaceId);
        const nextPublishedVersion = (wf.publishedVersion || 0) + 1;
        const versionDoc = new this.versionModel({
            organizationId: wf.organizationId,
            workspaceId: wf.workspaceId,
            workflowId: wf._id,
            version: nextPublishedVersion,
            nodes: wf.nodes,
            edges: wf.edges,
            triggerConfig: wf.triggerConfig,
            settings: wf.settings,
            publishedBy: this.toObjectId(userId),
            changelog,
        });
        await versionDoc.save();
        wf.publishedVersion = nextPublishedVersion;
        wf.isPublished = true;
        wf.status = 'active';
        await wf.save();
        this.logger.log(`Published workflow [${wf._id}] v${nextPublishedVersion}`);
        return wf;
    }
    async listVersions(workflowId, organizationId, workspaceId) {
        return this.versionModel
            .find({
            workflowId: this.toObjectId(workflowId),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        })
            .sort({ version: -1 })
            .exec();
    }
    async rollbackVersion(workflowId, versionNumber, organizationId, workspaceId, userId) {
        const historical = await this.versionModel.findOne({
            workflowId: this.toObjectId(workflowId),
            version: versionNumber,
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (!historical) {
            throw new common_1.NotFoundException(`Version ${versionNumber} not found for workflow [${workflowId}]`);
        }
        const wf = await this.update(workflowId, organizationId, workspaceId, {
            nodes: historical.nodes,
            edges: historical.edges,
            triggerConfig: historical.triggerConfig,
            settings: historical.settings,
        });
        this.logger.log(`Rolled back workflow [${workflowId}] to snapshot v${versionNumber}`);
        return wf;
    }
    async duplicate(workflowId, organizationId, workspaceId, userId, newName) {
        const source = await this.findById(workflowId, organizationId, workspaceId);
        const webhookId = source.triggerType === 'webhook' ? `wh_${crypto.randomBytes(16).toString('hex')}` : undefined;
        const cloned = new this.workflowModel({
            organizationId: source.organizationId,
            workspaceId: source.workspaceId,
            name: newName || `${source.name} (Copy)`,
            description: source.description,
            triggerType: source.triggerType,
            triggerConfig: source.triggerConfig,
            webhookId,
            nodes: source.nodes,
            edges: source.edges,
            status: 'draft',
            version: 1,
            publishedVersion: 0,
            isPublished: false,
            settings: source.settings,
            createdBy: this.toObjectId(userId),
        });
        await cloned.save();
        this.logger.log(`Duplicated workflow [${workflowId}] as new workflow [${cloned._id}]`);
        return cloned;
    }
    async triggerExecution(workflowId, organizationId, workspaceId, userId, dto) {
        if (this.subscriptionAccess) {
            await this.subscriptionAccess.canExecuteWorkflow(organizationId);
        }
        if (this.usageService) {
            await this.usageService.checkLimit(organizationId, 'workflowExecutions');
            await this.usageService.recordWorkflowExecution(organizationId);
        }
        const workflow = await this.findById(workflowId, organizationId, workspaceId);
        const execution = new this.executionModel({
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            workflowId: workflow._id,
            version: workflow.publishedVersion || workflow.version || 1,
            triggerType: workflow.triggerType,
            triggeredBy: userId ? this.toObjectId(userId) : undefined,
            status: 'queued',
            inputPayload: dto?.payload || {},
            steps: workflow.nodes.map((node) => ({
                nodeId: node.id,
                nodeType: node.type,
                nodeLabel: node.label,
                status: 'pending',
            })),
            aiUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
        });
        await execution.save();
        await this.executionQueue.add(queue_constants_1.JOB_EXECUTE_WORKFLOW, {
            executionId: execution._id.toString(),
            workflowId: workflow._id.toString(),
            organizationId,
            workspaceId,
            nodes: workflow.nodes,
            edges: workflow.edges,
            initialPayload: dto?.payload || {},
        }, {
            jobId: `exec-${execution._id}`,
            attempts: workflow.settings?.maxRetries || 3,
        });
        this.logger.log(`Enqueued workflow execution [${execution._id}] for workflow [${workflow._id}]`);
        return execution;
    }
    async triggerByWebhook(webhookId, payload) {
        const workflow = await this.workflowModel.findOne({
            webhookId,
            status: 'active',
            isDeleted: false,
        });
        if (!workflow) {
            throw new common_1.NotFoundException(`No active workflow found for webhook [${webhookId}]`);
        }
        return this.triggerExecution(workflow._id.toString(), workflow.organizationId.toString(), workflow.workspaceId.toString(), undefined, { payload });
    }
    async approveExecution(executionId, organizationId, workspaceId, userId, reason) {
        const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
        return this.workflowEngine.approveExecution(execution._id.toString(), userId, reason);
    }
    async rejectExecution(executionId, organizationId, workspaceId, userId, reason) {
        const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
        return this.workflowEngine.rejectExecution(execution._id.toString(), userId, reason);
    }
    async listExecutions(organizationId, workspaceId, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        };
        const [data, total] = await Promise.all([
            this.executionModel
                .find(filter)
                .populate('workflowId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.executionModel.countDocuments(filter).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async getExecutionById(executionId, organizationId, workspaceId) {
        const execution = await this.executionModel
            .findOne({
            _id: this.toObjectId(executionId),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        })
            .populate('workflowId', 'name nodes edges')
            .exec();
        if (!execution) {
            throw new common_1.NotFoundException('Execution record not found');
        }
        return execution;
    }
    async listDeadLetterQueue(organizationId, workspaceId, pagination) {
        const page = pagination.page || 1;
        const limit = pagination.limit || 20;
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
            status: 'failed',
        };
        const [data, total] = await Promise.all([
            this.executionModel
                .find(filter)
                .populate('workflowId', 'name')
                .sort({ finishedAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.executionModel.countDocuments(filter).exec(),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async retryDeadLetterJob(executionId, organizationId, workspaceId) {
        const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
        const workflow = execution.workflowId;
        execution.status = 'queued';
        execution.error = undefined;
        execution.startedAt = new Date();
        execution.finishedAt = undefined;
        await execution.save();
        await this.executionQueue.add(queue_constants_1.JOB_EXECUTE_WORKFLOW, {
            executionId: execution._id.toString(),
            workflowId: workflow._id.toString(),
            organizationId,
            workspaceId,
            nodes: workflow.nodes,
            edges: workflow.edges,
            initialPayload: execution.inputPayload || {},
        }, {
            jobId: `dlq-retry-${execution._id}-${Date.now()}`,
            attempts: 3,
        });
        this.logger.log(`Retried DLQ execution [${execution._id}]`);
        return execution;
    }
    async cancelDeadLetterJob(executionId, organizationId, workspaceId) {
        const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
        execution.status = 'cancelled';
        await execution.save();
        return execution;
    }
    async generateFromNaturalLanguage(organizationId, workspaceId, userId, prompt) {
        if (!prompt || !prompt.trim()) {
            throw new common_1.BadRequestException('Prompt description is required');
        }
        const schemaDescription = `{
  "name": "concise workflow title",
  "description": "summary of automation",
  "triggerType": "webhook | manual | schedule",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger | ai_classify | ai_generate | condition_branch | action_slack | action_hubspot | action_gmail | http_request",
      "label": "Human friendly label",
      "position": { "x": 250, "y": 100 },
      "data": {}
    }
  ],
  "edges": [
    { "id": "e1", "source": "node-1", "target": "node-2" }
  ]
}`;
        const systemPrompt = `You are a visual workflow DAG architect.
Convert the user's natural language automation request into a valid sequential DAG graph.
Always start with a trigger node (id: 'node-trigger', type: 'trigger'). Connect subsequent steps in logical order.`;
        const generated = await this.aiGateway.structuredOutput(`Generate workflow definition for:\n"${prompt}"`, schemaDescription, { systemPrompt, task: 'agent' });
        const data = generated.data;
        return this.create(organizationId, workspaceId, userId, {
            name: data.name || 'AI Generated Automation',
            description: data.description || prompt,
            triggerType: data.triggerType || 'webhook',
            nodes: data.nodes || [{ id: 'trigger-1', type: 'trigger', label: 'Trigger', position: { x: 250, y: 100 } }],
            edges: data.edges || [],
        });
    }
};
exports.WorkflowsService = WorkflowsService;
exports.WorkflowsService = WorkflowsService = WorkflowsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(workflow_schema_1.Workflow.name)),
    __param(1, (0, mongoose_1.InjectModel)(workflow_version_schema_1.WorkflowVersion.name)),
    __param(2, (0, mongoose_1.InjectModel)(workflow_execution_schema_1.WorkflowExecution.name)),
    __param(3, (0, bullmq_1.InjectQueue)(queue_constants_1.QUEUE_WORKFLOW_EXECUTION)),
    __param(6, (0, common_1.Optional)()),
    __param(7, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        bullmq_2.Queue,
        workflow_engine_service_1.WorkflowEngineService,
        ai_gateway_service_1.AiGatewayService,
        subscription_access_service_1.SubscriptionAccessService, Object])
], WorkflowsService);
//# sourceMappingURL=workflows.service.js.map