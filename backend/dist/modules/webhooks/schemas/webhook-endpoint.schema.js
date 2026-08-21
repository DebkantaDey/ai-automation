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
exports.WebhookEndpointSchema = exports.WebhookEndpoint = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let WebhookEndpoint = class WebhookEndpoint {
    organizationId;
    workspaceId;
    url;
    secret;
    eventTypes;
    description;
    status;
    createdBy;
    createdAt;
    updatedAt;
};
exports.WebhookEndpoint = WebhookEndpoint;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WebhookEndpoint.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WebhookEndpoint.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], WebhookEndpoint.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], WebhookEndpoint.prototype, "secret", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: ['*'] }),
    __metadata("design:type", Array)
], WebhookEndpoint.prototype, "eventTypes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true, default: '' }),
    __metadata("design:type", String)
], WebhookEndpoint.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'active', enum: ['active', 'disabled'], index: true }),
    __metadata("design:type", String)
], WebhookEndpoint.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], WebhookEndpoint.prototype, "createdBy", void 0);
exports.WebhookEndpoint = WebhookEndpoint = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], WebhookEndpoint);
exports.WebhookEndpointSchema = mongoose_1.SchemaFactory.createForClass(WebhookEndpoint);
exports.WebhookEndpointSchema.index({ organizationId: 1, workspaceId: 1, status: 1 });
//# sourceMappingURL=webhook-endpoint.schema.js.map