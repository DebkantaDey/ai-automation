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
exports.DeadLetterJobSchema = exports.DeadLetterJob = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DeadLetterJob = class DeadLetterJob {
    organizationId;
    workspaceId;
    workflowId;
    executionId;
    jobId;
    queueName;
    attemptsMade;
    maxAttempts;
    failedReason;
    stackTrace;
    failedStepNodeId;
    inputPayload;
    executionSnapshot;
    status;
    replayedAt;
    replayedByUserId;
    createdAt;
    updatedAt;
};
exports.DeadLetterJob = DeadLetterJob;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DeadLetterJob.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DeadLetterJob.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DeadLetterJob.prototype, "workflowId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'WorkflowExecution', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DeadLetterJob.prototype, "executionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', index: true }),
    __metadata("design:type", String)
], DeadLetterJob.prototype, "jobId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'workflow-execution' }),
    __metadata("design:type", String)
], DeadLetterJob.prototype, "queueName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], DeadLetterJob.prototype, "attemptsMade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 3 }),
    __metadata("design:type", Number)
], DeadLetterJob.prototype, "maxAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DeadLetterJob.prototype, "failedReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DeadLetterJob.prototype, "stackTrace", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DeadLetterJob.prototype, "failedStepNodeId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], DeadLetterJob.prototype, "inputPayload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], DeadLetterJob.prototype, "executionSnapshot", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'failed',
        enum: ['failed', 'retrying', 'resolved', 'dismissed'],
        index: true,
    }),
    __metadata("design:type", String)
], DeadLetterJob.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], DeadLetterJob.prototype, "replayedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], DeadLetterJob.prototype, "replayedByUserId", void 0);
exports.DeadLetterJob = DeadLetterJob = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], DeadLetterJob);
exports.DeadLetterJobSchema = mongoose_1.SchemaFactory.createForClass(DeadLetterJob);
exports.DeadLetterJobSchema.index({ organizationId: 1, status: 1, createdAt: -1 });
exports.DeadLetterJobSchema.index({ executionId: 1 });
//# sourceMappingURL=dead-letter-job.schema.js.map