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
exports.WebhookEventSchema = exports.WebhookEvent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let WebhookEvent = class WebhookEvent {
    provider;
    providerEventId;
    eventType;
    status;
    payload;
    processedAt;
    error;
    createdAt;
    updatedAt;
};
exports.WebhookEvent = WebhookEvent;
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['stripe', 'razorpay'], required: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "providerEventId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "eventType", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['processed', 'failed', 'ignored'],
        default: 'processed',
        index: true,
    }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], WebhookEvent.prototype, "payload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], WebhookEvent.prototype, "processedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false }),
    __metadata("design:type", String)
], WebhookEvent.prototype, "error", void 0);
exports.WebhookEvent = WebhookEvent = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], WebhookEvent);
exports.WebhookEventSchema = mongoose_1.SchemaFactory.createForClass(WebhookEvent);
exports.WebhookEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });
//# sourceMappingURL=webhook-event.schema.js.map