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
exports.InvoiceSchema = exports.Invoice = exports.InvoiceLineItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
class InvoiceLineItem {
    description;
    quantity;
    unitPrice;
    amount;
}
exports.InvoiceLineItem = InvoiceLineItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], InvoiceLineItem.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 1, min: 1 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "unitPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], InvoiceLineItem.prototype, "amount", void 0);
let Invoice = class Invoice {
    organizationId;
    workspaceId;
    invoiceNumber;
    customerId;
    leadId;
    items;
    subtotal;
    taxRate;
    taxAmount;
    discountAmount;
    total;
    currency;
    status;
    issuedDate;
    dueDate;
    paidAt;
    paymentProvider;
    paymentReference;
    hostedPaymentUrl;
    pdfUrl;
    notes;
    isDeleted;
    deletedAt;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
};
exports.Invoice = Invoice;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lead', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "leadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [InvoiceLineItem], default: [] }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "subtotal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "taxAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "discountAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0 }),
    __metadata("design:type", Number)
], Invoice.prototype, "total", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'USD', uppercase: true, trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'draft',
        enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
        index: true,
    }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Invoice.prototype, "issuedDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, required: true, index: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Invoice.prototype, "paidAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'stripe',
        enum: ['stripe', 'razorpay', 'manual', 'wire'],
    }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentProvider", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentReference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "hostedPaymentUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "pdfUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Invoice.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Invoice.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Invoice.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Invoice.prototype, "updatedBy", void 0);
exports.Invoice = Invoice = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Invoice);
exports.InvoiceSchema = mongoose_1.SchemaFactory.createForClass(Invoice);
exports.InvoiceSchema.index({ organizationId: 1, invoiceNumber: 1 }, { unique: true });
exports.InvoiceSchema.index({ organizationId: 1, status: 1, isDeleted: 1 });
exports.InvoiceSchema.index({ organizationId: 1, dueDate: 1 });
//# sourceMappingURL=invoice.schema.js.map