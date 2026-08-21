import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agent, AgentDocument } from './schemas/agent.schema';
import { AgentExecution, AgentExecutionDocument } from './schemas/agent-execution.schema';
import { AgentEngineService } from './engine/agent-engine.service';
import { UsageService } from '../billing/services/usage.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

export interface CreateAgentDto {
  name: string;
  description?: string;
  instructions: string;
  provider?: string;
  model?: string;
  tools?: any[];
  knowledgeSources?: string[];
  limits?: {
    maxSteps?: number;
    maxTokens?: number;
    maxToolCalls?: number;
    timeoutSeconds?: number;
  };
}

@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectModel(Agent.name) private readonly agentModel: Model<AgentDocument>,
    @InjectModel(AgentExecution.name) private readonly executionModel: Model<AgentExecutionDocument>,
    private readonly agentEngine: AgentEngineService,
    @Optional() private readonly usageService?: UsageService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createAgent(
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: CreateAgentDto,
  ): Promise<AgentDocument> {
    const agent = new this.agentModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      name: dto.name,
      description: dto.description || '',
      instructions: dto.instructions,
      provider: dto.provider || 'openai',
      model: dto.model || 'gpt-4o',
      tools: dto.tools || [],
      knowledgeSources: dto.knowledgeSources || [],
      limits: {
        maxSteps: dto.limits?.maxSteps || 10,
        maxTokens: dto.limits?.maxTokens || 4000,
        maxToolCalls: dto.limits?.maxToolCalls || 5,
        timeoutSeconds: dto.limits?.timeoutSeconds || 60,
      },
      createdBy: this.toObjectId(userId),
    });

    return agent.save();
  }

  async listAgents(organizationId: string, workspaceId: string, pagination: PaginationQueryDto) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      status: { $ne: 'archived' },
    };

    const [data, total] = await Promise.all([
      this.agentModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.agentModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAgentById(id: string, organizationId: string, workspaceId: string): Promise<AgentDocument> {
    const agent = await this.agentModel.findOne({
      _id: this.toObjectId(id),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (!agent) {
      throw new NotFoundException(`Agent [${id}] not found`);
    }
    return agent;
  }

  async updateAgent(
    id: string,
    organizationId: string,
    workspaceId: string,
    updates: Partial<CreateAgentDto> & { status?: string },
  ): Promise<AgentDocument> {
    const agent = await this.agentModel.findOneAndUpdate(
      {
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      },
      { $set: updates },
      { new: true },
    );

    if (!agent) {
      throw new NotFoundException(`Agent [${id}] not found`);
    }
    return agent;
  }

  async deleteAgent(id: string, organizationId: string, workspaceId: string): Promise<void> {
    const res = await this.agentModel.deleteOne({
      _id: this.toObjectId(id),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException(`Agent [${id}] not found`);
    }
  }

  async runAgent(
    agentId: string,
    organizationId: string,
    workspaceId: string,
    userId: string,
    inputPrompt: string,
  ): Promise<AgentExecutionDocument> {
    if (!inputPrompt || !inputPrompt.trim()) {
      throw new BadRequestException('inputPrompt is required to run agent');
    }

    if (this.usageService) {
      await this.usageService.checkLimit(organizationId, 'aiExecutions');
    }

    const agent = await this.getAgentById(agentId, organizationId, workspaceId);

    const execution = new this.executionModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      agentId: agent._id,
      inputPrompt,
      status: 'queued',
      triggeredBy: this.toObjectId(userId),
    });
    await execution.save();

    const completedExecution = await this.agentEngine.runAgentLoop(agent, execution);

    if (this.usageService && completedExecution.aiUsage) {
      await this.usageService.recordAIUsage(organizationId, completedExecution.aiUsage);
    }

    return completedExecution;
  }

  async listExecutions(
    agentId: string,
    organizationId: string,
    workspaceId: string,
    pagination: PaginationQueryDto,
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter = {
      agentId: this.toObjectId(agentId),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    };

    const [data, total] = await Promise.all([
      this.executionModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
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
}
