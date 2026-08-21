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
exports.AgentSchema = exports.Agent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Agent = class Agent {
    organizationId;
    workspaceId;
    name;
    description;
    instructions;
    provider;
    model;
    tools;
    knowledgeSources;
    memorySettings;
    limits;
    status;
    createdBy;
    createdAt;
    updatedAt;
};
exports.Agent = Agent;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Agent.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Agent.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Agent.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Agent.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Agent.prototype, "instructions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'openai' }),
    __metadata("design:type", String)
], Agent.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'gpt-4o' }),
    __metadata("design:type", String)
], Agent.prototype, "model", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Agent.prototype, "tools", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Agent.prototype, "knowledgeSources", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: { enableMemory: true, maxHistoryTurns: 10 } }),
    __metadata("design:type", Object)
], Agent.prototype, "memorySettings", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: {
            maxSteps: 10,
            maxTokens: 4000,
            maxToolCalls: 5,
            timeoutSeconds: 60,
        },
    }),
    __metadata("design:type", Object)
], Agent.prototype, "limits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'paused', 'archived'], index: true }),
    __metadata("design:type", String)
], Agent.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Agent.prototype, "createdBy", void 0);
exports.Agent = Agent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Agent);
exports.AgentSchema = mongoose_1.SchemaFactory.createForClass(Agent);
exports.AgentSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
//# sourceMappingURL=agent.schema.js.map