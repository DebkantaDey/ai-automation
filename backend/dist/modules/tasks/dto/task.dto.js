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
exports.UpdateTaskDto = exports.CreateTaskDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTaskDto {
    title;
    description;
    assigneeUserId;
    customerId;
    leadId;
    priority;
    status;
    dueDate;
    isAiGenerated;
    source;
    tags;
}
exports.CreateTaskDto = CreateTaskDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Prepare Custom Proposal Document for Global Logistics' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Task title is required' }),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Draft tailored pricing tiers based on 50 seat volume' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e101' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "assigneeUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e102' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e103' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'high', enum: ['low', 'medium', 'high', 'urgent'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high', 'urgent']),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'todo', enum: ['todo', 'in_progress', 'completed', 'cancelled'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['todo', 'in_progress', 'completed', 'cancelled']),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-08-28T18:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTaskDto.prototype, "isAiGenerated", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Workflow: Inbound Lead Qualification' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTaskDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['sales', 'proposal'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateTaskDto.prototype, "tags", void 0);
class UpdateTaskDto {
    title;
    description;
    assigneeUserId;
    status;
    priority;
    dueDate;
}
exports.UpdateTaskDto = UpdateTaskDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "assigneeUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'in_progress' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['todo', 'in_progress', 'completed', 'cancelled']),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'urgent' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high', 'urgent']),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateTaskDto.prototype, "dueDate", void 0);
//# sourceMappingURL=task.dto.js.map