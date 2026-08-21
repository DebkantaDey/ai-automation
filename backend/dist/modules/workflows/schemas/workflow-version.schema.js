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
exports.WorkflowVersionSchema = exports.WorkflowVersion = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let WorkflowVersion = class WorkflowVersion {
    organizationId;
    workspaceId;
    workflowId;
    version;
    nodes;
    edges;
    triggerConfig;
    settings;
    publishedBy;
    changelog;
    createdAt;
    updatedAt;
};
exports.WorkflowVersion = WorkflowVersion;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowVersion.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowVersion.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workflow', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowVersion.prototype, "workflowId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], WorkflowVersion.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, required: true }),
    __metadata("design:type", Array)
], WorkflowVersion.prototype, "nodes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, required: true }),
    __metadata("design:type", Array)
], WorkflowVersion.prototype, "edges", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], WorkflowVersion.prototype, "triggerConfig", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], WorkflowVersion.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WorkflowVersion.prototype, "publishedBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], WorkflowVersion.prototype, "changelog", void 0);
exports.WorkflowVersion = WorkflowVersion = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], WorkflowVersion);
exports.WorkflowVersionSchema = mongoose_1.SchemaFactory.createForClass(WorkflowVersion);
exports.WorkflowVersionSchema.index({ workflowId: 1, version: 1 }, { unique: true });
exports.WorkflowVersionSchema.index({ organizationId: 1, workspaceId: 1 });
//# sourceMappingURL=workflow-version.schema.js.map