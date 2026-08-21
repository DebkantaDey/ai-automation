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
exports.OrganizationSchema = exports.Organization = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Organization = class Organization {
    name;
    slug;
    logo;
    logoUrl;
    description;
    industry;
    website;
    ownerId;
    status;
    timezone;
    country;
    defaultCurrency;
    plan;
    billingCustomerId;
    subscriptionId;
    subscriptionStatus;
    settings;
    isDeleted;
    deletedAt;
    createdAt;
    updatedAt;
};
exports.Organization = Organization;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Organization.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Organization.prototype, "logo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Organization.prototype, "logoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Organization.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Organization.prototype, "industry", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Organization.prototype, "website", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Organization.prototype, "ownerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['active', 'suspended', 'trial', 'cancelled'],
        default: 'active',
        index: true,
    }),
    __metadata("design:type", String)
], Organization.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'UTC' }),
    __metadata("design:type", String)
], Organization.prototype, "timezone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'US' }),
    __metadata("design:type", String)
], Organization.prototype, "country", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD' }),
    __metadata("design:type", String)
], Organization.prototype, "defaultCurrency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'free', enum: ['free', 'starter', 'pro', 'enterprise'] }),
    __metadata("design:type", String)
], Organization.prototype, "plan", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, index: true }),
    __metadata("design:type", String)
], Organization.prototype, "billingCustomerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], Organization.prototype, "subscriptionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'trialing', 'past_due', 'canceled', 'paused'] }),
    __metadata("design:type", String)
], Organization.prototype, "subscriptionStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Organization.prototype, "settings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Organization.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Organization.prototype, "deletedAt", void 0);
exports.Organization = Organization = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Organization);
exports.OrganizationSchema = mongoose_1.SchemaFactory.createForClass(Organization);
exports.OrganizationSchema.index({ ownerId: 1, isDeleted: 1 });
exports.OrganizationSchema.index({ status: 1, isDeleted: 1 });
//# sourceMappingURL=organization.schema.js.map