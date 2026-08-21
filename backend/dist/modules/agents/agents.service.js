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
var AgentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const agent_schema_1 = require("./schemas/agent.schema");
const agent_execution_schema_1 = require("./schemas/agent-execution.schema");
const agent_engine_service_1 = require("./engine/agent-engine.service");
const usage_service_1 = require("../billing/services/usage.service");
let AgentsService = AgentsService_1 = class AgentsService {
    agentModel;
    executionModel;
    agentEngine;
    usageService;
    logger = new common_1.Logger(AgentsService_1.name);
    constructor(agentModel, executionModel, agentEngine, usageService) {
        this.agentModel = agentModel;
        this.executionModel = executionModel;
        this.agentEngine = agentEngine;
        this.usageService = usageService;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createAgent(organizationId, workspaceId, userId, dto) {
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
    async listAgents(organizationId, workspaceId, pagination) {
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
    async getAgentById(id, organizationId, workspaceId) {
        const agent = await this.agentModel.findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (!agent) {
            throw new common_1.NotFoundException(`Agent [${id}] not found`);
        }
        return agent;
    }
    async updateAgent(id, organizationId, workspaceId, updates) {
        const agent = await this.agentModel.findOneAndUpdate({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        }, { $set: updates }, { new: true });
        if (!agent) {
            throw new common_1.NotFoundException(`Agent [${id}] not found`);
        }
        return agent;
    }
    async deleteAgent(id, organizationId, workspaceId) {
        const res = await this.agentModel.deleteOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            workspaceId: this.toObjectId(workspaceId),
        });
        if (res.deletedCount === 0) {
            throw new common_1.NotFoundException(`Agent [${id}] not found`);
        }
    }
    async runAgent(agentId, organizationId, workspaceId, userId, inputPrompt) {
        if (!inputPrompt || !inputPrompt.trim()) {
            throw new common_1.BadRequestException('inputPrompt is required to run agent');
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
    async listExecutions(agentId, organizationId, workspaceId, pagination) {
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
};
exports.AgentsService = AgentsService;
exports.AgentsService = AgentsService = AgentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(agent_schema_1.Agent.name)),
    __param(1, (0, mongoose_1.InjectModel)(agent_execution_schema_1.AgentExecution.name)),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        agent_engine_service_1.AgentEngineService,
        usage_service_1.UsageService])
], AgentsService);
//# sourceMappingURL=agents.service.js.map