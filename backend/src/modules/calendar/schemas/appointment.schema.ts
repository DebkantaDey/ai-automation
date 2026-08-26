import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type AppointmentChannel =
  | 'google_meet'
  | 'zoom'
  | 'in_person'
  | 'phone';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Appointment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Lead', default: null, index: true })
  leadId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null, index: true })
  staffUserId?: Types.ObjectId;

  @Prop({ required: true, type: Date, index: true })
  startTime: Date;

  @Prop({ required: true, type: Date, index: true })
  endTime: Date;

  @Prop({ default: 30, min: 5, max: 480 })
  durationMinutes: number;

  @Prop({
    default: 'scheduled',
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    index: true,
  })
  status: AppointmentStatus;

  @Prop({
    default: 'google_meet',
    enum: ['google_meet', 'zoom', 'in_person', 'phone'],
  })
  channel: AppointmentChannel;

  @Prop({ default: '', trim: true })
  meetingUrl?: string;

  @Prop({ default: '', trim: true })
  location?: string;

  @Prop({ default: false, index: true })
  isAiScheduled: boolean;

  @Prop({ type: Date, default: null })
  reminderSentAt?: Date;

  @Prop({ default: '', trim: true })
  notes?: string;

  @Prop({ type: Boolean, default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  createdBy?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  updatedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ organizationId: 1, startTime: 1, isDeleted: 1 });
AppointmentSchema.index({ organizationId: 1, staffUserId: 1, startTime: 1 });
