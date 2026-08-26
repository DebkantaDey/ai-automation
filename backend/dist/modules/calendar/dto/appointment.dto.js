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
exports.SetAvailabilityDto = exports.UpdateAppointmentDto = exports.CreateAppointmentDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateAppointmentDto {
    title;
    description;
    customerId;
    leadId;
    staffUserId;
    startTime;
    durationMinutes;
    channel;
    meetingUrl;
    isAiScheduled;
}
exports.CreateAppointmentDto = CreateAppointmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Enterprise Architecture & AI Demo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Appointment title is required' }),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '30-minute demonstration of visual DAG workflows' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e101' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e102' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "leadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '60d5ecb8b392d721b8f1e103' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "staffUserId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-08-26T14:00:00.000Z' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 45 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5),
    (0, class_validator_1.Max)(480),
    __metadata("design:type", Number)
], CreateAppointmentDto.prototype, "durationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'google_meet', enum: ['google_meet', 'zoom', 'in_person', 'phone'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['google_meet', 'zoom', 'in_person', 'phone']),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://meet.google.com/abc-defg-hij' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAppointmentDto.prototype, "meetingUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAppointmentDto.prototype, "isAiScheduled", void 0);
class UpdateAppointmentDto {
    status;
    startTime;
    channel;
    meetingUrl;
    notes;
}
exports.UpdateAppointmentDto = UpdateAppointmentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'confirmed', enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-08-26T15:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'google_meet' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['google_meet', 'zoom', 'in_person', 'phone']),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "meetingUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAppointmentDto.prototype, "notes", void 0);
class SetAvailabilityDto {
    dayOfWeek;
    startTime;
    endTime;
    slotDurationMinutes;
    bufferMinutes;
}
exports.SetAvailabilityDto = SetAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: '0 for Sunday, 1 for Monday, etc.' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    __metadata("design:type", Number)
], SetAvailabilityDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetAvailabilityDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '17:00' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SetAvailabilityDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 30 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SetAvailabilityDto.prototype, "slotDurationMinutes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SetAvailabilityDto.prototype, "bufferMinutes", void 0);
//# sourceMappingURL=appointment.dto.js.map