import { AppointmentsService } from '../services/appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, SetAvailabilityDto } from '../dto/appointment.dto';
export declare class AppointmentsController {
    private readonly appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    createAppointment(orgId: string, wsId: string, userId: string, dto: CreateAppointmentDto): Promise<import("../schemas/appointment.schema").AppointmentDocument>;
    listAppointments(orgId: string, startDate?: string, endDate?: string, staffUserId?: string, customerId?: string, status?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/appointment.schema").AppointmentDocument, {}, {}> & import("../schemas/appointment.schema").Appointment & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
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
    getAvailableSlots(orgId: string, date: string, staffUserId?: string): Promise<{
        date: string;
        dayOfWeek: number;
        slots: any[];
    }>;
    setAvailability(orgId: string, wsId: string, userId: string, dto: SetAvailabilityDto): Promise<import("../schemas/availability.schema").AvailabilityDocument>;
    getAppointmentById(orgId: string, id: string): Promise<import("../schemas/appointment.schema").AppointmentDocument>;
    updateAppointment(orgId: string, userId: string, id: string, dto: UpdateAppointmentDto): Promise<import("../schemas/appointment.schema").AppointmentDocument>;
    deleteAppointment(orgId: string, userId: string, id: string): Promise<boolean>;
}
