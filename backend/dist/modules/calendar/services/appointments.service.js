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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AppointmentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const appointment_schema_1 = require("../schemas/appointment.schema");
const availability_schema_1 = require("../schemas/availability.schema");
const customer_schema_1 = require("../../crm/schemas/customer.schema");
const customer_activity_schema_1 = require("../../crm/schemas/customer-activity.schema");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let AppointmentsService = AppointmentsService_1 = class AppointmentsService {
    appointmentModel;
    availabilityModel;
    customerModel;
    activityModel;
    eventBus;
    logger = new common_1.Logger(AppointmentsService_1.name);
    constructor(appointmentModel, availabilityModel, customerModel, activityModel, eventBus) {
        this.appointmentModel = appointmentModel;
        this.availabilityModel = availabilityModel;
        this.customerModel = customerModel;
        this.activityModel = activityModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createAppointment(organizationId, userId, dto, workspaceId) {
        if (!dto) {
            throw new common_1.BadRequestException('Appointment payload is required');
        }
        const start = new Date(dto.startTime);
        const duration = dto.durationMinutes || 30;
        const end = new Date(start.getTime() + duration * 60 * 1000);
        if (dto.staffUserId) {
            const conflict = await this.appointmentModel.findOne({
                organizationId: this.toObjectId(organizationId),
                staffUserId: this.toObjectId(dto.staffUserId),
                status: { $in: ['scheduled', 'confirmed'] },
                isDeleted: false,
                $or: [
                    { startTime: { $lt: end, $gte: start } },
                    { endTime: { $gt: start, $lte: end } },
                    { startTime: { $lte: start }, endTime: { $gte: end } },
                ],
            }).exec();
            if (conflict) {
                throw new common_1.BadRequestException('The selected staff member is unavailable during this time slot.');
            }
        }
        const appointment = new this.appointmentModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
            customerId: dto.customerId ? this.toObjectId(dto.customerId) : undefined,
            leadId: dto.leadId ? this.toObjectId(dto.leadId) : undefined,
            staffUserId: dto.staffUserId ? this.toObjectId(dto.staffUserId) : undefined,
            startTime: start,
            endTime: end,
            durationMinutes: duration,
            createdBy: userId ? this.toObjectId(userId) : undefined,
        });
        await appointment.save();
        if (appointment.customerId) {
            const act = new this.activityModel({
                organizationId: this.toObjectId(organizationId),
                customerId: appointment.customerId,
                activityType: 'appointment',
                title: `Appointment Booked: ${appointment.title}`,
                description: `Scheduled for ${start.toISOString()} via ${appointment.channel}`,
                source: appointment.isAiScheduled ? 'ai' : 'human',
                createdBy: userId ? this.toObjectId(userId) : undefined,
            });
            await act.save();
        }
        this.logger.log(`Created appointment [${appointment.title}] in Org [${organizationId}]`);
        this.eventBus.emit('calendar.appointment_booked', organizationId, workspaceId, { appointmentId: appointment._id, startTime: appointment.startTime });
        return appointment;
    }
    async listAppointments(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        };
        if (query.status && query.status !== 'all') {
            filter.status = query.status.toLowerCase();
        }
        if (query.staffUserId) {
            filter.staffUserId = this.toObjectId(query.staffUserId);
        }
        if (query.customerId) {
            filter.customerId = this.toObjectId(query.customerId);
        }
        if (query.startDate || query.endDate) {
            filter.startTime = {};
            if (query.startDate)
                filter.startTime.$gte = new Date(query.startDate);
            if (query.endDate)
                filter.startTime.$lte = new Date(query.endDate);
        }
        const [appointments, total] = await Promise.all([
            this.appointmentModel
                .find(filter)
                .sort({ startTime: 1 })
                .skip(skip)
                .limit(limit)
                .populate('customerId', 'name company email phone')
                .populate('staffUserId', 'firstName lastName email')
                .exec(),
            this.appointmentModel.countDocuments(filter).exec(),
        ]);
        return {
            data: appointments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getAppointmentById(organizationId, id) {
        const apt = await this.appointmentModel
            .findOne({
            _id: this.toObjectId(id),
            organizationId: this.toObjectId(organizationId),
            isDeleted: false,
        })
            .populate('customerId', 'name company email phone')
            .populate('staffUserId', 'firstName lastName email')
            .exec();
        if (!apt) {
            throw new common_1.NotFoundException(`Appointment with id '${id}' not found`);
        }
        return apt;
    }
    async updateAppointment(organizationId, id, dto, userId) {
        const apt = await this.getAppointmentById(organizationId, id);
        if (dto.startTime) {
            const start = new Date(dto.startTime);
            const end = new Date(start.getTime() + apt.durationMinutes * 60 * 1000);
            apt.startTime = start;
            apt.endTime = end;
        }
        Object.assign(apt, {
            ...dto,
            startTime: apt.startTime,
            endTime: apt.endTime,
            updatedBy: userId ? this.toObjectId(userId) : undefined,
        });
        await apt.save();
        return apt;
    }
    async getAvailableSlots(organizationId, dateStr, staffUserId) {
        const targetDate = new Date(dateStr);
        const dayOfWeek = targetDate.getUTCDay();
        const availability = staffUserId
            ? await this.availabilityModel.findOne({
                organizationId: this.toObjectId(organizationId),
                userId: this.toObjectId(staffUserId),
                dayOfWeek,
                isActive: true,
            })
            : null;
        const startHour = availability ? parseInt(availability.startTime.split(':')[0], 10) : 9;
        const endHour = availability ? parseInt(availability.endTime.split(':')[0], 10) : 17;
        const slotDuration = availability?.slotDurationMinutes || 30;
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const filter = {
            organizationId: this.toObjectId(organizationId),
            startTime: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['scheduled', 'confirmed'] },
            isDeleted: false,
        };
        if (staffUserId) {
            filter.staffUserId = this.toObjectId(staffUserId);
        }
        const booked = await this.appointmentModel.find(filter).exec();
        const slots = [];
        for (let h = startHour; h < endHour; h++) {
            for (let m = 0; m < 60; m += slotDuration) {
                const slotStart = new Date(targetDate);
                slotStart.setUTCHours(h, m, 0, 0);
                const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);
                const isConflict = booked.some((b) => (slotStart >= b.startTime && slotStart < b.endTime) ||
                    (slotEnd > b.startTime && slotEnd <= b.endTime));
                slots.push({
                    startTime: slotStart.toISOString(),
                    endTime: slotEnd.toISOString(),
                    available: !isConflict,
                });
            }
        }
        return {
            date: dateStr,
            dayOfWeek,
            slots,
        };
    }
    async setAvailability(organizationId, userId, dto, workspaceId) {
        const existing = await this.availabilityModel.findOne({
            organizationId: this.toObjectId(organizationId),
            userId: this.toObjectId(userId),
            dayOfWeek: dto.dayOfWeek,
        });
        if (existing) {
            Object.assign(existing, dto);
            await existing.save();
            return existing;
        }
        const avail = new this.availabilityModel({
            ...dto,
            organizationId: this.toObjectId(organizationId),
            workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
            userId: this.toObjectId(userId),
        });
        await avail.save();
        return avail;
    }
    async deleteAppointment(organizationId, id, userId) {
        const apt = await this.getAppointmentById(organizationId, id);
        apt.isDeleted = true;
        apt.status = 'cancelled';
        apt.deletedAt = new Date();
        apt.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await apt.save();
        this.eventBus.emit('calendar.appointment_cancelled', organizationId, apt.workspaceId?.toString(), { appointmentId: apt._id });
        return true;
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = AppointmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(appointment_schema_1.Appointment.name)),
    __param(1, (0, mongoose_1.InjectModel)(availability_schema_1.Availability.name)),
    __param(2, (0, mongoose_1.InjectModel)(customer_schema_1.Customer.name)),
    __param(3, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        event_bus_service_1.EventBusService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map