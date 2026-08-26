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
exports.LeadSchema = exports.Lead = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Lead = class Lead {
    organizationId;
    workspaceId;
    name;
    email;
    phone;
    company;
    source;
    status;
    priority;
    leadScore;
    scoreConfidence;
    scoreReasons;
    scoreGeneratedAt;
    assignedUserId;
    tags;
    notes;
    customFields;
    lastContactAt;
    nextFollowUpAt;
    convertedCustomerId;
    isDeleted;
    deletedAt;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
};
exports.Lead = Lead;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Lead.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, lowercase: true, trim: true, default: '' }),
    __metadata("design:type", String)
], Lead.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Lead.prototype, "phone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Lead.prototype, "company", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'website',
        enum: ['website', 'whatsapp', 'email', 'manual', 'referral', 'api', 'phone', 'other'],
        index: true,
    }),
    __metadata("design:type", String)
], Lead.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'new',
        enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'],
        index: true,
    }),
    __metadata("design:type", String)
], Lead.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'medium',
        enum: ['low', 'medium', 'high'],
        index: true,
    }),
    __metadata("design:type", String)
], Lead.prototype, "priority", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 50, min: 0, max: 100, index: true }),
    __metadata("design:type", Number)
], Lead.prototype, "leadScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0.8, min: 0, max: 1 }),
    __metadata("design:type", Number)
], Lead.prototype, "scoreConfidence", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Lead.prototype, "scoreReasons", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Lead.prototype, "scoreGeneratedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "assignedUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Lead.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Lead.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Lead.prototype, "customFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Lead.prototype, "lastContactAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Lead.prototype, "nextFollowUpAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "convertedCustomerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Lead.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Lead.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Lead.prototype, "updatedBy", void 0);
exports.Lead = Lead = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Lead);
exports.LeadSchema = mongoose_1.SchemaFactory.createForClass(Lead);
exports.LeadSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
exports.LeadSchema.index({ organizationId: 1, leadScore: -1 });
exports.LeadSchema.index({ organizationId: 1, email: 1 });
exports.LeadSchema.index({ organizationId: 1, phone: 1 });
//# sourceMappingURL=lead.schema.js.map