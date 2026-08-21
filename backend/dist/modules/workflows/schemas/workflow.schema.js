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
exports.WorkflowSchema = exports.Workflow = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Workflow = class Workflow {
    organizationId;
    workspaceId;
    name;
    description;
    triggerType;
    triggerConfig;
    webhookId;
    nodes;
    edges;
    status;
    version;
    publishedVersion;
    isPublished;
    settings;
    createdBy;
    updatedBy;
    isDeleted;
    deletedAt;
    createdAt;
    updatedAt;
};
exports.Workflow = Workflow;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Workflow.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Workflow.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Workflow.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Workflow.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'manual',
        enum: ['manual', 'webhook', 'schedule', 'app_event'],
        index: true,
    }),
    __metadata("design:type", String)
], Workflow.prototype, "triggerType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Workflow.prototype, "triggerConfig", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Workflow.prototype, "webhookId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Workflow.prototype, "nodes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Workflow.prototype, "edges", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'draft',
        enum: ['draft', 'active', 'paused'],
        index: true,
    }),
    __metadata("design:type", String)
], Workflow.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], Workflow.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Workflow.prototype, "publishedVersion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isPublished", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            maxExecutionTimeMs: { type: Number, default: 300000 },
            retryOnFailure: { type: Boolean, default: true },
            maxRetries: { type: Number, default: 3 },
            requireHumanApproval: { type: Boolean, default: false },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Workflow.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Workflow.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Workflow.prototype, "updatedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Workflow.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Workflow.prototype, "deletedAt", void 0);
exports.Workflow = Workflow = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Workflow);
exports.WorkflowSchema = mongoose_1.SchemaFactory.createForClass(Workflow);
exports.WorkflowSchema.index({ organizationId: 1, workspaceId: 1, isDeleted: 1 });
exports.WorkflowSchema.index({ webhookId: 1 }, { sparse: true });
//# sourceMappingURL=workflow.schema.js.map