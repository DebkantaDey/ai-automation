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
exports.PaymentLedgerSchema = exports.PaymentLedger = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let PaymentLedger = class PaymentLedger {
    organizationId;
    workspaceId;
    invoiceId;
    customerId;
    amount;
    currency;
    status;
    provider;
    transactionId;
    paymentMethod;
    metadata;
    createdAt;
};
exports.PaymentLedger = PaymentLedger;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaymentLedger.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaymentLedger.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Invoice', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaymentLedger.prototype, "invoiceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], PaymentLedger.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], PaymentLedger.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], PaymentLedger.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'succeeded',
        enum: ['succeeded', 'pending', 'failed', 'refunded'],
        index: true,
    }),
    __metadata("design:type", String)
], PaymentLedger.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'stripe', enum: ['stripe', 'razorpay', 'manual', 'wire'] }),
    __metadata("design:type", String)
], PaymentLedger.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], PaymentLedger.prototype, "transactionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'card', trim: true }),
    __metadata("design:type", String)
], PaymentLedger.prototype, "paymentMethod", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], PaymentLedger.prototype, "metadata", void 0);
exports.PaymentLedger = PaymentLedger = __decorate([
    (0, mongoose_1.Schema)({ timestamps: { createdAt: true, updatedAt: false }, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], PaymentLedger);
exports.PaymentLedgerSchema = mongoose_1.SchemaFactory.createForClass(PaymentLedger);
exports.PaymentLedgerSchema.index({ organizationId: 1, createdAt: -1 });
exports.PaymentLedgerSchema.index({ invoiceId: 1 });
//# sourceMappingURL=payment-ledger.schema.js.map