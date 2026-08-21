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
exports.UpdateWorkspaceDto = exports.CreateWorkspaceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateWorkspaceDto {
    name;
    slug;
    description;
    color;
    icon;
    timezone;
    settings;
}
exports.CreateWorkspaceDto = CreateWorkspaceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Marketing Automation' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Workspace name is required' }),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], CreateWorkspaceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'marketing-automation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, {
        message: 'Slug must contain only lowercase alphanumeric characters and hyphens',
    }),
    __metadata("design:type", String)
], CreateWorkspaceDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Workflows and integrations for marketing team' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateWorkspaceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#10B981' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkspaceDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Megaphone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkspaceDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'UTC' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWorkspaceDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { aiModelDefault: 'gpt-4o' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateWorkspaceDto.prototype, "settings", void 0);
class UpdateWorkspaceDto {
    name;
    description;
    color;
    icon;
    timezone;
    status;
    settings;
}
exports.UpdateWorkspaceDto = UpdateWorkspaceDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Marketing Automation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(60),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated workspace description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#10B981' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "color", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Layers' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "icon", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'America/New_York' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['active', 'archived', 'suspended'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'archived', 'suspended']),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateWorkspaceDto.prototype, "settings", void 0);
//# sourceMappingURL=create-workspace.dto.js.map