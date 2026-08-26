import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type AvailabilityDocument = Availability & Document;
export declare class Availability {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    userId: Types.ObjectId;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    bufferMinutes: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const AvailabilitySchema: MongooseSchema<Availability, import("mongoose").Model<Availability, any, any, any, Document<unknown, any, Availability, any, {}> & Availability & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Availability, Document<unknown, {}, import("mongoose").FlatRecord<Availability>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Availability> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
