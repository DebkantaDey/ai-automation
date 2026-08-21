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
exports.PlanSchema = exports.Plan = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Plan = class Plan {
    name;
    slug;
    description;
    monthlyPrice;
    yearlyPrice;
    currency;
    features;
    limits;
    isActive;
    isPublic;
    isPopular;
    providerReferences;
    createdAt;
    updatedAt;
};
exports.Plan = Plan;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Plan.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, lowercase: true, trim: true }),
    __metadata("design:type", String)
], Plan.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], Plan.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Plan.prototype, "monthlyPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], Plan.prototype, "yearlyPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], Plan.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Plan.prototype, "features", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            maxUsers: { type: Number, default: 2 },
            maxWorkspaces: { type: Number, default: 1 },
            maxWorkflows: { type: Number, default: 5 },
            maxIntegrations: { type: Number, default: 3 },
            maxWorkflowExecutions: { type: Number, default: 1000 },
            maxAIExecutions: { type: Number, default: 100 },
            maxAITokens: { type: Number, default: 100000 },
            maxStorage: { type: Number, default: 500 },
            maxAPIRequests: { type: Number, default: 5000 },
            maxKnowledgeDocuments: { type: Number, default: 10 },
        },
        default: {},
    }),
    __metadata("design:type", Object)
], Plan.prototype, "limits", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Plan.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Plan.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Plan.prototype, "isPopular", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Plan.prototype, "providerReferences", void 0);
exports.Plan = Plan = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Plan);
exports.PlanSchema = mongoose_1.SchemaFactory.createForClass(Plan);
//# sourceMappingURL=plan.schema.js.map