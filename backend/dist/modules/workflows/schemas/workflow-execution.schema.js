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
exports.WorkflowExecutionSchema = exports.WorkflowExecution = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let WorkflowExecution = class WorkflowExecution {
    organizationId;
    workspaceId;
    workflowId;
    version;
    triggerType;
    triggeredBy;
    status;
    inputPayload;
    outputPayload;
    steps;
    aiUsage;
    approvalDetails;
    startedAt;
    finishedAt;
    durationMs;
    error;
    createdAt;
    updatedAt;
};
exports.WorkflowExecution = WorkflowExecution;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowExecution.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowExecution.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowExecution.prototype, "workflowId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'manual', index: true }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "triggerType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowExecution.prototype, "triggeredBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'queued',
        enum: ['queued', 'running', 'completed', 'failed', 'waiting_approval', 'cancelled'],
    }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "inputPayload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "outputPayload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], WorkflowExecution.prototype, "steps", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: Object,
        default: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
    }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "aiUsage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], WorkflowExecution.prototype, "approvalDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "startedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], WorkflowExecution.prototype, "finishedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], WorkflowExecution.prototype, "durationMs", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], WorkflowExecution.prototype, "error", void 0);
exports.WorkflowExecution = WorkflowExecution = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], WorkflowExecution);
exports.WorkflowExecutionSchema = mongoose_1.SchemaFactory.createForClass(WorkflowExecution);
exports.WorkflowExecutionSchema.index({ organizationId: 1, workspaceId: 1, createdAt: -1 });
exports.WorkflowExecutionSchema.index({ workflowId: 1, createdAt: -1 });
exports.WorkflowExecutionSchema.index({ status: 1 });
exports.WorkflowExecutionSchema.index({ 'approvalDetails.approvalToken': 1 }, { sparse: true });
//# sourceMappingURL=workflow-execution.schema.js.map