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
exports.AgentExecutionSchema = exports.AgentExecution = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AgentExecution = class AgentExecution {
    organizationId;
    workspaceId;
    agentId;
    status;
    inputPrompt;
    finalOutput;
    steps;
    aiUsage;
    error;
    startedAt;
    finishedAt;
    durationMs;
    triggeredBy;
    createdAt;
    updatedAt;
};
exports.AgentExecution = AgentExecution;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AgentExecution.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AgentExecution.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Agent', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AgentExecution.prototype, "agentId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'queued',
        enum: ['queued', 'running', 'completed', 'failed', 'timeout'],
        index: true,
    }),
    __metadata("design:type", String)
], AgentExecution.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], AgentExecution.prototype, "inputPrompt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], AgentExecution.prototype, "finalOutput", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], AgentExecution.prototype, "steps", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
    }),
    __metadata("design:type", Object)
], AgentExecution.prototype, "aiUsage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], AgentExecution.prototype, "error", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], AgentExecution.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], AgentExecution.prototype, "finishedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], AgentExecution.prototype, "durationMs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AgentExecution.prototype, "triggeredBy", void 0);
exports.AgentExecution = AgentExecution = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], AgentExecution);
exports.AgentExecutionSchema = mongoose_1.SchemaFactory.createForClass(AgentExecution);
exports.AgentExecutionSchema.index({ agentId: 1, createdAt: -1 });
exports.AgentExecutionSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
//# sourceMappingURL=agent-execution.schema.js.map