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
exports.WorkspaceSchema = exports.Workspace = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Workspace = class Workspace {
    organizationId;
    name;
    slug;
    description;
    createdBy;
    status;
    color;
    icon;
    timezone;
    isDefault;
    settings;
    isDeleted;
    deletedAt;
    createdAt;
    updatedAt;
};
exports.Workspace = Workspace;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Workspace.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Workspace.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Workspace.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Workspace.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Workspace.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'archived', 'suspended'],
        default: 'active',
        index: true,
    }),
    __metadata("design:type", String)
], Workspace.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '#3B82F6' }),
    __metadata("design:type", String)
], Workspace.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'Layers' }),
    __metadata("design:type", String)
], Workspace.prototype, "icon", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'UTC' }),
    __metadata("design:type", String)
], Workspace.prototype, "timezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Workspace.prototype, "isDefault", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Workspace.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Workspace.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Workspace.prototype, "deletedAt", void 0);
exports.Workspace = Workspace = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Workspace);
exports.WorkspaceSchema = mongoose_1.SchemaFactory.createForClass(Workspace);
exports.WorkspaceSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
exports.WorkspaceSchema.index({ organizationId: 1, isDeleted: 1 });
//# sourceMappingURL=workspace.schema.js.map