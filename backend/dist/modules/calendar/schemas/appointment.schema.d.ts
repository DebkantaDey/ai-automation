import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentChannel = 'google_meet' | 'zoom' | 'in_person' | 'phone';
export type AppointmentDocument = Appointment & Document;
export declare class Appointment {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    title: string;
    description?: string;
    customerId?: Types.ObjectId;
    leadId?: Types.ObjectId;
    staffUserId?: Types.ObjectId;
    startTime: Date;
    endTime: Date;
    durationMinutes: number;
    status: AppointmentStatus;
    channel: AppointmentChannel;
    meetingUrl?: string;
    location?: string;
    isAiScheduled: boolean;
    reminderSentAt?: Date;
    notes?: string;
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AppointmentSchema: MongooseSchema<Appointment, import("mongoose").Model<Appointment, any, any, any, Document<unknown, any, Appointment, any, {}> & Appointment & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Appointment, Document<unknown, {}, import("mongoose").FlatRecord<Appointment>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Appointment> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
