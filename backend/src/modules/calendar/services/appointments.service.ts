import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';
import { Availability, AvailabilityDocument } from '../schemas/availability.schema';
import { Customer, CustomerDocument } from '../../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  SetAvailabilityDto,
} from '../dto/appointment.dto';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Availability.name)
    private readonly availabilityModel: Model<AvailabilityDocument>,
    @InjectModel(Customer.name)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createAppointment(
    organizationId: string,
    userId?: string,
    dto?: CreateAppointmentDto,
    workspaceId?: string,
  ): Promise<AppointmentDocument> {
    if (!dto) {
      throw new BadRequestException('Appointment payload is required');
    }

    const start = new Date(dto.startTime);
    const duration = dto.durationMinutes || 30;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    // Conflict detection for staff
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
        throw new BadRequestException('The selected staff member is unavailable during this time slot.');
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

    // Log on Customer 360 timeline
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

    this.eventBus.emit(
      'calendar.appointment_booked',
      organizationId,
      workspaceId,
      { appointmentId: appointment._id, startTime: appointment.startTime },
    );

    return appointment;
  }

  async listAppointments(
    organizationId: string,
    query: {
      startDate?: string;
      endDate?: string;
      staffUserId?: string;
      customerId?: string;
      status?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {
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
      if (query.startDate) filter.startTime.$gte = new Date(query.startDate);
      if (query.endDate) filter.startTime.$lte = new Date(query.endDate);
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

  async getAppointmentById(organizationId: string, id: string): Promise<AppointmentDocument> {
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
      throw new NotFoundException(`Appointment with id '${id}' not found`);
    }
    return apt;
  }

  async updateAppointment(
    organizationId: string,
    id: string,
    dto: UpdateAppointmentDto,
    userId?: string,
  ): Promise<AppointmentDocument> {
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

  async getAvailableSlots(
    organizationId: string,
    dateStr: string,
    staffUserId?: string,
  ) {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getUTCDay();

    // 1. Fetch staff availability rule for this day
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

    // 2. Fetch existing booked appointments on target date
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] },
      isDeleted: false,
    };
    if (staffUserId) {
      filter.staffUserId = this.toObjectId(staffUserId);
    }

    const booked = await this.appointmentModel.find(filter).exec();

    // 3. Generate time slots
    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += slotDuration) {
        const slotStart = new Date(targetDate);
        slotStart.setUTCHours(h, m, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60 * 1000);

        const isConflict = booked.some(
          (b) =>
            (slotStart >= b.startTime && slotStart < b.endTime) ||
            (slotEnd > b.startTime && slotEnd <= b.endTime),
        );

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

  async setAvailability(
    organizationId: string,
    userId: string,
    dto: SetAvailabilityDto,
    workspaceId?: string,
  ): Promise<AvailabilityDocument> {
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

  async deleteAppointment(organizationId: string, id: string, userId?: string): Promise<boolean> {
    const apt = await this.getAppointmentById(organizationId, id);
    apt.isDeleted = true;
    apt.status = 'cancelled';
    apt.deletedAt = new Date();
    apt.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await apt.save();

    this.eventBus.emit(
      'calendar.appointment_cancelled',
      organizationId,
      apt.workspaceId?.toString(),
      { appointmentId: apt._id },
    );

    return true;
  }
}
