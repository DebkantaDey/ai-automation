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
exports.InvoiceSchema = exports.Invoice = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Invoice = class Invoice {
    organizationId;
    subscriptionId;
    provider;
    providerInvoiceId;
    invoiceNumber;
    amount;
    amountPaid;
    currency;
    status;
    invoiceUrl;
    invoicePdf;
    issueDate;
    dueDate;
    paidAt;
    lineItems;
    metadata;
    createdAt;
    updatedAt;
};
exports.Invoice = Invoice;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Subscription', required: false, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "subscriptionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['stripe', 'razorpay', 'manual'], required: true }),
    __metadata("design:type", String)
], Invoice.prototype, "provider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true, trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "providerInvoiceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "amountPaid", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['draft', 'open', 'paid', 'uncollectible', 'void', 'failed'],
        default: 'open',
        index: true,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: false, trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoicePdf", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Invoice.prototype, "issueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Invoice.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], Invoice.prototype, "lineItems", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Invoice.prototype, "metadata", void 0);
exports.Invoice = Invoice = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Invoice);
exports.InvoiceSchema = mongoose_1.SchemaFactory.createForClass(Invoice);
exports.InvoiceSchema.index({ organizationId: 1, createdAt: -1 });
exports.InvoiceSchema.index({ provider: 1, providerInvoiceId: 1 });
//# sourceMappingURL=invoice.schema.js.map