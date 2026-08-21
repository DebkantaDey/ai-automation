import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrivacyConsentDocument = PrivacyConsent & Document;

@Schema({ timestamps: true })
export class PrivacyConsent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization', index: true })
  organizationId?: Types.ObjectId;

  @Prop({ default: true })
  analyticsConsent: boolean;

  @Prop({ default: false })
  marketingConsent: boolean;

  @Prop({ default: true })
  dataProcessingConsent: boolean;

  @Prop()
  ipAddress?: string;

  @Prop({ default: Date.now })
  consentTimestamp: Date;
}

export const PrivacyConsentSchema = SchemaFactory.createForClass(PrivacyConsent);
PrivacyConsentSchema.index({ userId: 1, organizationId: 1 }, { unique: true });
