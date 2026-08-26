import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';
import { WorkflowVersion, WorkflowVersionDocument } from './schemas/workflow-version.schema';
import { WorkflowExecution, WorkflowExecutionDocument } from './schemas/workflow-execution.schema';
import { CreateWorkflowDto, TriggerExecutionDto } from './dto/create-workflow.dto';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { WorkflowEngineService } from './engine/workflow-engine.service';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';
import { SubscriptionAccessService } from '../billing/services/subscription-access.service';
import { AiGatewayService } from '../../integrations/ai/ai-gateway.service';
import {
  QUEUE_WORKFLOW_EXECUTION,
  JOB_EXECUTE_WORKFLOW,
} from '../../core/queue/queue.constants';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    @InjectModel(Workflow.name) private readonly workflowModel: Model<WorkflowDocument>,
    @InjectModel(WorkflowVersion.name) private readonly versionModel: Model<WorkflowVersionDocument>,
    @InjectModel(WorkflowExecution.name) private readonly executionModel: Model<WorkflowExecutionDocument>,
    @InjectQueue(QUEUE_WORKFLOW_EXECUTION) private readonly executionQueue: Queue,
    private readonly workflowEngine: WorkflowEngineService,
    private readonly aiGateway: AiGatewayService,
    @Optional() private readonly deadLetterService?: DeadLetterQueueService,
    @Optional() private readonly subscriptionAccess?: SubscriptionAccessService,
    @Optional() private readonly usageService?: any,
  ) {}

  getDeadLetterQueueService(): DeadLetterQueueService | undefined {
    return this.deadLetterService;
  }

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async create(
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: CreateWorkflowDto,
  ): Promise<WorkflowDocument> {
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

  async list(organizationId: string, workspaceId: string, pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
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

  async findById(workflowId: string, organizationId: string, workspaceId: string): Promise<WorkflowDocument> {
    const wf = await this.workflowModel.findOne({
      _id: this.toObjectId(workflowId),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      isDeleted: false,
    });

    if (!wf) {
      throw new NotFoundException('Workflow not found');
    }
    return wf;
  }

  async update(
    workflowId: string,
    organizationId: string,
    workspaceId: string,
    updates: Partial<CreateWorkflowDto> & { status?: string },
  ): Promise<WorkflowDocument> {
    const wf = await this.workflowModel.findOneAndUpdate(
      {
        _id: this.toObjectId(workflowId),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
        isDeleted: false,
      },
      { $set: updates, $inc: { version: 1 } },
      { new: true },
    );

    if (!wf) {
      throw new NotFoundException('Workflow not found');
    }
    return wf;
  }

  async updateStatus(
    workflowId: string,
    organizationId: string,
    workspaceId: string,
    status: 'draft' | 'active' | 'paused' | 'disabled' | 'archived',
  ): Promise<WorkflowDocument> {
    return this.update(workflowId, organizationId, workspaceId, { status });
  }

  async publish(
    workflowId: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    changelog = 'Published version',
  ): Promise<WorkflowDocument> {
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

  async listVersions(workflowId: string, organizationId: string, workspaceId: string) {
    return this.versionModel
      .find({
        workflowId: this.toObjectId(workflowId),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      })
      .sort({ version: -1 })
      .exec();
  }

  async rollbackVersion(
    workflowId: string,
    versionNumber: number,
    organizationId: string,
    workspaceId: string,
    userId: string,
  ): Promise<WorkflowDocument> {
    const historical = await this.versionModel.findOne({
      workflowId: this.toObjectId(workflowId),
      version: versionNumber,
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (!historical) {
      throw new NotFoundException(`Version ${versionNumber} not found for workflow [${workflowId}]`);
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

  async duplicate(
    workflowId: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    newName?: string,
  ): Promise<WorkflowDocument> {
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

  async triggerExecution(
    workflowId: string,
    organizationId: string,
    workspaceId: string,
    userId?: string,
    dto?: TriggerExecutionDto,
  ): Promise<WorkflowExecutionDocument> {
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

    // Enqueue background processing job to BullMQ
    await this.executionQueue.add(
      JOB_EXECUTE_WORKFLOW,
      {
        executionId: execution._id.toString(),
        workflowId: workflow._id.toString(),
        organizationId,
        workspaceId,
        nodes: workflow.nodes,
        edges: workflow.edges,
        initialPayload: dto?.payload || {},
      },
      {
        jobId: `exec-${execution._id}`,
        attempts: workflow.settings?.maxRetries || 3,
      },
    );

    this.logger.log(`Enqueued workflow execution [${execution._id}] for workflow [${workflow._id}]`);
    return execution;
  }

  async triggerByWebhook(webhookId: string, payload: Record<string, any>): Promise<WorkflowExecutionDocument> {
    const workflow = await this.workflowModel.findOne({
      webhookId,
      status: 'active',
      isDeleted: false,
    });

    if (!workflow) {
      throw new NotFoundException(`No active workflow found for webhook [${webhookId}]`);
    }

    return this.triggerExecution(
      workflow._id.toString(),
      workflow.organizationId.toString(),
      workflow.workspaceId.toString(),
      undefined,
      { payload },
    );
  }

  async approveExecution(
    executionId: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    reason?: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
    return this.workflowEngine.approveExecution(execution._id.toString(), userId, reason);
  }

  async rejectExecution(
    executionId: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    reason?: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
    return this.workflowEngine.rejectExecution(execution._id.toString(), userId, reason);
  }

  async listExecutions(organizationId: string, workspaceId: string, pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
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

  async getExecutionById(
    executionId: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.executionModel
      .findOne({
        _id: this.toObjectId(executionId),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      })
      .populate('workflowId', 'name nodes edges')
      .exec();

    if (!execution) {
      throw new NotFoundException('Execution record not found');
    }
    return execution;
  }

  async listDeadLetterQueue(organizationId: string, workspaceId: string, pagination: PaginationQueryDto) {
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

  async retryDeadLetterJob(
    executionId: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
    const workflow = execution.workflowId as any;

    execution.status = 'queued';
    execution.error = undefined;
    execution.startedAt = new Date();
    execution.finishedAt = undefined;
    await execution.save();

    await this.executionQueue.add(
      JOB_EXECUTE_WORKFLOW,
      {
        executionId: execution._id.toString(),
        workflowId: workflow._id.toString(),
        organizationId,
        workspaceId,
        nodes: workflow.nodes,
        edges: workflow.edges,
        initialPayload: execution.inputPayload || {},
      },
      {
        jobId: `dlq-retry-${execution._id}-${Date.now()}`,
        attempts: 3,
      },
    );

    this.logger.log(`Retried DLQ execution [${execution._id}]`);
    return execution;
  }

  async cancelDeadLetterJob(
    executionId: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<WorkflowExecutionDocument> {
    const execution = await this.getExecutionById(executionId, organizationId, workspaceId);
    execution.status = 'cancelled';
    await execution.save();
    return execution;
  }

  async generateFromNaturalLanguage(
    organizationId: string,
    workspaceId: string,
    userId: string,
    prompt: string,
  ): Promise<WorkflowDocument> {
    if (!prompt || !prompt.trim()) {
      throw new BadRequestException('Prompt description is required');
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

    const generated = await this.aiGateway.structuredOutput<any>(
      `Generate workflow definition for:\n"${prompt}"`,
      schemaDescription,
      { systemPrompt, task: 'agent' },
    );

    const data = generated.data;

    return this.create(organizationId, workspaceId, userId, {
      name: data.name || 'AI Generated Automation',
      description: data.description || prompt,
      triggerType: data.triggerType || 'webhook',
      nodes: data.nodes || [{ id: 'trigger-1', type: 'trigger', label: 'Trigger', position: { x: 250, y: 100 } }],
      edges: data.edges || [],
    });
  }
}
