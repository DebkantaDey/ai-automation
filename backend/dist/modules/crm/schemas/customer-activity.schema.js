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
exports.CustomerActivitySchema = exports.CustomerActivity = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CustomerActivity = class CustomerActivity {
    organizationId;
    workspaceId;
    customerId;
    leadId;
    activityType;
    title;
    description;
    metadata;
    source;
    createdBy;
    createdAt;
};
exports.CustomerActivity = CustomerActivity;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CustomerActivity.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CustomerActivity.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CustomerActivity.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lead', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CustomerActivity.prototype, "leadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        required: true,
        enum: ['message', 'invoice', 'appointment', 'task', 'ai_interaction', 'note', 'stage_change', 'call', 'email'],
        index: true,
    }),
    __metadata("design:type", String)
], CustomerActivity.prototype, "activityType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], CustomerActivity.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], CustomerActivity.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], CustomerActivity.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'human', enum: ['human', 'ai', 'system'] }),
    __metadata("design:type", String)
], CustomerActivity.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CustomerActivity.prototype, "createdBy", void 0);
exports.CustomerActivity = CustomerActivity = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], CustomerActivity);
exports.CustomerActivitySchema = mongoose_1.SchemaFactory.createForClass(CustomerActivity);
exports.CustomerActivitySchema.index({ customerId: 1, createdAt: -1 });
exports.CustomerActivitySchema.index({ organizationId: 1, createdAt: -1 });
//# sourceMappingURL=customer-activity.schema.js.map