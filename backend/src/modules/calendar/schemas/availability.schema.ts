import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AvailabilityDocument = Availability & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Availability {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', index: true, default: null })
  workspaceId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 6, index: true })
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  @Prop({ required: true, default: '09:00' })
  startTime: string; // HH:mm format

  @Prop({ required: true, default: '17:00' })
  endTime: string; // HH:mm format

  @Prop({ default: 30, min: 5, max: 240 })
  slotDurationMinutes: number;

  @Prop({ default: 10, min: 0, max: 60 })
  bufferMinutes: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AvailabilitySchema = SchemaFactory.createForClass(Availability);

AvailabilitySchema.index({ organizationId: 1, userId: 1, dayOfWeek: 1 });
