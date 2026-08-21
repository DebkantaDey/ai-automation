import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type NotificationPreferenceDocument = NotificationPreference & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class NotificationPreference {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', required: true, index: true })
  workspaceId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({
    type: Object,
    default: {
      inApp: true,
      email: true,
      slack: false,
      webhook: false,
    },
  })
  channels: {
    inApp: boolean;
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };

  @Prop({
    type: Object,
    default: {
      'workflow.completed': true,
      'workflow.failed': true,
      'workflow.waiting_approval': true,
      'payment.succeeded': true,
      'payment.failed': true,
      'trial.ending': true,
      'ai.limit_reached': true,
    },
  })
  events: Record<string, boolean>;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(NotificationPreference);

NotificationPreferenceSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
