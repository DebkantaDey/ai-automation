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
exports.AvailabilitySchema = exports.Availability = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Availability = class Availability {
    organizationId;
    workspaceId;
    userId;
    dayOfWeek;
    startTime;
    endTime;
    slotDurationMinutes;
    bufferMinutes;
    isActive;
    createdAt;
    updatedAt;
};
exports.Availability = Availability;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Availability.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Availability.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Availability.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 6, index: true }),
    __metadata("design:type", Number)
], Availability.prototype, "dayOfWeek", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: '09:00' }),
    __metadata("design:type", String)
], Availability.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: '17:00' }),
    __metadata("design:type", String)
], Availability.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 30, min: 5, max: 240 }),
    __metadata("design:type", Number)
], Availability.prototype, "slotDurationMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 10, min: 0, max: 60 }),
    __metadata("design:type", Number)
], Availability.prototype, "bufferMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true, index: true }),
    __metadata("design:type", Boolean)
], Availability.prototype, "isActive", void 0);
exports.Availability = Availability = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Availability);
exports.AvailabilitySchema = mongoose_1.SchemaFactory.createForClass(Availability);
exports.AvailabilitySchema.index({ organizationId: 1, userId: 1, dayOfWeek: 1 });
//# sourceMappingURL=availability.schema.js.map