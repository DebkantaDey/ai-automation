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
exports.ConvertLeadDto = exports.UpdateLeadDto = exports.CreateLeadDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateLeadDto {
    name;
    email;
    phone;
    company;
    source;
    status;
    priority;
    tags;
    notes;
    assignedUserId;
    customFields;
}
exports.CreateLeadDto = CreateLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'David Vance' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Lead name is required' }),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'dvance@logistics-core.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email format' }),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1 (555) 234-5678' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Global Logistics Corp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'whatsapp', enum: ['website', 'whatsapp', 'email', 'manual', 'referral', 'api', 'phone', 'other'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'new', enum: ['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost']),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'high', enum: ['low', 'medium', 'high'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high']),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['enterprise', 'high-intent'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateLeadDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Interested in automated appointment booking' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e101' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateLeadDto.prototype, "assignedUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { budget: 50000, companySize: 120 } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateLeadDto.prototype, "customFields", void 0);
class UpdateLeadDto {
    name;
    email;
    phone;
    company;
    status;
    priority;
    leadScore;
    tags;
    notes;
    assignedUserId;
    customFields;
}
exports.UpdateLeadDto = UpdateLeadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'David Vance' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'dvance@logistics-core.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+1 (555) 234-5678' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Global Logistics Corp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'qualified' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost']),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'high' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high']),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 92 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdateLeadDto.prototype, "leadScore", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['enterprise'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateLeadDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Notes updated' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateLeadDto.prototype, "assignedUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateLeadDto.prototype, "customFields", void 0);
class ConvertLeadDto {
    dealTitle;
    dealValue;
}
exports.ConvertLeadDto = ConvertLeadDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Enterprise Annual Subscription' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConvertLeadDto.prototype, "dealTitle", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 48000 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ConvertLeadDto.prototype, "dealValue", void 0);
//# sourceMappingURL=lead.dto.js.map