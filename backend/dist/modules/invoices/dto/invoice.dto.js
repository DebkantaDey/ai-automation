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
exports.MarkPaidDto = exports.UpdateInvoiceDto = exports.CreateInvoiceDto = exports.InvoiceLineItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class InvoiceLineItemDto {
    description;
    quantity;
    unitPrice;
    amount;
}
exports.InvoiceLineItemDto = InvoiceLineItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Enterprise Monthly Orchestration Plan' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InvoiceLineItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], InvoiceLineItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4800 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4800 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], InvoiceLineItemDto.prototype, "amount", void 0);
class CreateInvoiceDto {
    customerId;
    leadId;
    items;
    taxRate;
    discountAmount;
    currency;
    dueDate;
    paymentProvider;
    notes;
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '60d5ecb8b392d721b8f1e101' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'customerId is required' }),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e102' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [InvoiceLineItemDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => InvoiceLineItemDto),
    __metadata("design:type", Array)
], CreateInvoiceDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "taxRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateInvoiceDto.prototype, "discountAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-15T23:59:59.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'stripe', enum: ['stripe', 'razorpay', 'manual', 'wire'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['stripe', 'razorpay', 'manual', 'wire']),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "paymentProvider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Payment due within 30 days of invoice receipt.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "notes", void 0);
class UpdateInvoiceDto {
    status;
    dueDate;
    notes;
    paymentReference;
}
exports.UpdateInvoiceDto = UpdateInvoiceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'sent', enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded']),
    __metadata("design:type", String)
], UpdateInvoiceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateInvoiceDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInvoiceDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInvoiceDto.prototype, "paymentReference", void 0);
class MarkPaidDto {
    provider;
    transactionId;
    paymentMethod;
}
exports.MarkPaidDto = MarkPaidDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'stripe', enum: ['stripe', 'razorpay', 'manual', 'wire'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarkPaidDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'ch_3Nabc123456789' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarkPaidDto.prototype, "transactionId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'card' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MarkPaidDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=invoice.dto.js.map