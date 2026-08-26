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
exports.AppointmentSchema = exports.Appointment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Appointment = class Appointment {
    organizationId;
    workspaceId;
    title;
    description;
    customerId;
    leadId;
    staffUserId;
    startTime;
    endTime;
    durationMinutes;
    status;
    channel;
    meetingUrl;
    location;
    isAiScheduled;
    reminderSentAt;
    notes;
    isDeleted;
    deletedAt;
    createdBy;
    updatedBy;
    createdAt;
    updatedAt;
};
exports.Appointment = Appointment;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "organizationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Workspace', index: true, default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "workspaceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Appointment.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Appointment.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Lead', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "leadId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "staffUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date, index: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Date, index: true }),
    __metadata("design:type", Date)
], Appointment.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 30, min: 5, max: 480 }),
    __metadata("design:type", Number)
], Appointment.prototype, "durationMinutes", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'scheduled',
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
        index: true,
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        default: 'google_meet',
        enum: ['google_meet', 'zoom', 'in_person', 'phone'],
    }),
    __metadata("design:type", String)
], Appointment.prototype, "channel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Appointment.prototype, "meetingUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Appointment.prototype, "location", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "isAiScheduled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Appointment.prototype, "reminderSentAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '', trim: true }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false, index: true }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Date)
], Appointment.prototype, "deletedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "createdBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', default: null }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Appointment.prototype, "updatedBy", void 0);
exports.Appointment = Appointment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
], Appointment);
exports.AppointmentSchema = mongoose_1.SchemaFactory.createForClass(Appointment);
exports.AppointmentSchema.index({ organizationId: 1, startTime: 1, isDeleted: 1 });
exports.AppointmentSchema.index({ organizationId: 1, staffUserId: 1, startTime: 1 });
//# sourceMappingURL=appointment.schema.js.map