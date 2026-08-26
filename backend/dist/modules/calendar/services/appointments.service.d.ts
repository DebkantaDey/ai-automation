import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument } from '../schemas/appointment.schema';
import { AvailabilityDocument } from '../schemas/availability.schema';
import { CustomerDocument } from '../../crm/schemas/customer.schema';
import { CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import { CreateAppointmentDto, UpdateAppointmentDto, SetAvailabilityDto } from '../dto/appointment.dto';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class AppointmentsService {
    private readonly appointmentModel;
    private readonly availabilityModel;
    private readonly customerModel;
    private readonly activityModel;
    private readonly eventBus;
    private readonly logger;
    constructor(appointmentModel: Model<AppointmentDocument>, availabilityModel: Model<AvailabilityDocument>, customerModel: Model<CustomerDocument>, activityModel: Model<CustomerActivityDocument>, eventBus: EventBusService);
    private toObjectId;
    createAppointment(organizationId: string, userId?: string, dto?: CreateAppointmentDto, workspaceId?: string): Promise<AppointmentDocument>;
    listAppointments(organizationId: string, query?: {
        startDate?: string;
        endDate?: string;
        staffUserId?: string;
        customerId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, AppointmentDocument, {}, {}> & Appointment & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAppointmentById(organizationId: string, id: string): Promise<AppointmentDocument>;
    updateAppointment(organizationId: string, id: string, dto: UpdateAppointmentDto, userId?: string): Promise<AppointmentDocument>;
    getAvailableSlots(organizationId: string, dateStr: string, staffUserId?: string): Promise<{
        date: string;
        dayOfWeek: number;
        slots: any[];
    }>;
    setAvailability(organizationId: string, userId: string, dto: SetAvailabilityDto, workspaceId?: string): Promise<AvailabilityDocument>;
    deleteAppointment(organizationId: string, id: string, userId?: string): Promise<boolean>;
}
