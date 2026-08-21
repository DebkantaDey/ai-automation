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
exports.InviteMemberDto = exports.CreateOrganizationDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../../core/common/enums/role.enum");
class CreateOrganizationDto {
    name;
    slug;
    logo;
    logoUrl;
    description;
    industry;
    website;
    timezone;
    country;
    defaultCurrency;
}
exports.CreateOrganizationDto = CreateOrganizationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Acme Technologies' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Organization name is required' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'acme-technologies' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
    }),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.company.com/logo.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://cdn.company.com/logo.png' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Enterprise AI automation solutions provider' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Technology' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "industry", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://acme.com' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "website", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'America/New_York', default: 'UTC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'US', default: 'US' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'USD', default: 'USD' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrganizationDto.prototype, "defaultCurrency", void 0);
class InviteMemberDto {
    email;
    role = role_enum_1.OrganizationRole.MEMBER;
}
exports.InviteMemberDto = InviteMemberDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'colleague@company.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email is required' }),
    __metadata("design:type", String)
], InviteMemberDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'member', enum: role_enum_1.OrganizationRole, default: role_enum_1.OrganizationRole.MEMBER }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InviteMemberDto.prototype, "role", void 0);
//# sourceMappingURL=create-org.dto.js.map