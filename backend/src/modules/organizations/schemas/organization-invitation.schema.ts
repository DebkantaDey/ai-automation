import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export type OrganizationInvitationDocument = OrganizationInvitation & Document;

@Schema({ timestamps: true })
export class OrganizationInvitation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ required: true, default: 'member' })
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', default: null })
  roleId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  invitedBy: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'declined', 'revoked'],
    default: 'pending',
    index: true,
  })
  status: InvitationStatus;

  @Prop({ default: null })
  acceptedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const OrganizationInvitationSchema = SchemaFactory.createForClass(OrganizationInvitation);

OrganizationInvitationSchema.index({ organizationId: 1, email: 1, status: 1 });
OrganizationInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
