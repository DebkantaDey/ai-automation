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
exports.InboundMessagePayloadDto = exports.UpdateConversationDto = exports.ToggleAiTakeoverDto = exports.SendMessageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SendMessageDto {
    content;
    channel;
    attachments;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hello! Thanks for reaching out. We would love to schedule your demo.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Message content is required' }),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'whatsapp', enum: ['whatsapp', 'email', 'webchat', 'sms'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['whatsapp', 'email', 'webchat', 'sms']),
    __metadata("design:type", String)
], SendMessageDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: [{ type: 'image', url: 'https://cdn.domain.com/doc.pdf', name: 'Proposal.pdf' }] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SendMessageDto.prototype, "attachments", void 0);
class ToggleAiTakeoverDto {
    isAiHandled;
    reason;
}
exports.ToggleAiTakeoverDto = ToggleAiTakeoverDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: true, description: 'True to let AI handle, False for human takeover' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleAiTakeoverDto.prototype, "isAiHandled", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Staff agent took over to handle custom price negotiation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ToggleAiTakeoverDto.prototype, "reason", void 0);
class UpdateConversationDto {
    status;
    assignedUserId;
    tags;
}
exports.UpdateConversationDto = UpdateConversationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'closed', enum: ['open', 'closed', 'snoozed'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['open', 'closed', 'snoozed']),
    __metadata("design:type", String)
], UpdateConversationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConversationDto.prototype, "assignedUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: ['vip', 'demo-requested'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], UpdateConversationDto.prototype, "tags", void 0);
class InboundMessagePayloadDto {
    channel;
    senderIdentifier;
    senderName;
    content;
    externalMessageId;
    rawPayload;
}
exports.InboundMessagePayloadDto = InboundMessagePayloadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'whatsapp' }),
    (0, class_validator_1.IsEnum)(['whatsapp', 'email', 'webchat', 'sms']),
    __metadata("design:type", String)
], InboundMessagePayloadDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+1 (555) 234-5678' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InboundMessagePayloadDto.prototype, "senderIdentifier", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'David Vance' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InboundMessagePayloadDto.prototype, "senderName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Can we schedule a 30-min demo for tomorrow at 2:00 PM?' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InboundMessagePayloadDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'wamid.HBgLMjM0...' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InboundMessagePayloadDto.prototype, "externalMessageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], InboundMessagePayloadDto.prototype, "rawPayload", void 0);
//# sourceMappingURL=inbox.dto.js.map