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
exports.ChangePlanDto = exports.CreateCheckoutDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCheckoutDto {
    planSlug;
    billingInterval;
    provider;
    successUrl;
    cancelUrl;
}
exports.CreateCheckoutDto = CreateCheckoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'starter', description: 'Plan slug (e.g. starter, business, enterprise)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Plan slug is required' }),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "planSlug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'monthly', enum: ['monthly', 'yearly'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['monthly', 'yearly'], { message: 'Billing interval must be either monthly or yearly' }),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "billingInterval", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'stripe', enum: ['stripe', 'razorpay'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'http://localhost:3000/settings/billing?success=true' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "successUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'http://localhost:3000/settings/billing?cancelled=true' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCheckoutDto.prototype, "cancelUrl", void 0);
class ChangePlanDto {
    planSlug;
    billingInterval;
}
exports.ChangePlanDto = ChangePlanDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'business', description: 'Target plan slug' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Plan slug is required' }),
    __metadata("design:type", String)
], ChangePlanDto.prototype, "planSlug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'monthly', enum: ['monthly', 'yearly'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsIn)(['monthly', 'yearly']),
    __metadata("design:type", String)
], ChangePlanDto.prototype, "billingInterval", void 0);
//# sourceMappingURL=create-checkout.dto.js.map