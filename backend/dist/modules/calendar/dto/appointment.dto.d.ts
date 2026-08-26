import { AppointmentStatus, AppointmentChannel } from '../schemas/appointment.schema';
export declare class CreateAppointmentDto {
    title: string;
    description?: string;
    customerId?: string;
    leadId?: string;
    staffUserId?: string;
    startTime: string;
    durationMinutes?: number;
    channel?: AppointmentChannel;
    meetingUrl?: string;
    isAiScheduled?: boolean;
}
export declare class UpdateAppointmentDto {
    status?: AppointmentStatus;
    startTime?: string;
    channel?: AppointmentChannel;
    meetingUrl?: string;
    notes?: string;
}
export declare class SetAvailabilityDto {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes?: number;
    bufferMinutes?: number;
}
