import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { SystemRole } from '../../../core/common/enums/role.enum';

export type UserStatus = 'active' | 'suspended' | 'pending' | 'deleted';

export interface AuthProviderInfo {
  provider: 'google' | 'microsoft' | 'local' | string;
  providerUserId: string;
  email?: string;
  connectedAt: Date;
}

export type UserDocument = User & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class User {
  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: false, trim: true, default: '' })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false, select: false })
  passwordHash?: string;

  @Prop({ required: false })
  profileImage?: string;

  @Prop({ required: false, trim: true })
  phoneNumber?: string;

  @Prop({ default: false, index: true })
  emailVerified: boolean;

  @Prop({
    type: String,
    enum: ['active', 'suspended', 'pending', 'deleted'],
    default: 'pending',
    index: true,
  })
  status: UserStatus;

  @Prop({ default: null })
  lastLoginAt?: Date;

  @Prop({ required: false })
  lastLoginIp?: string;

  @Prop({ required: false })
  lastLoginUserAgent?: string;

  @Prop({
    type: [
      {
        provider: { type: String, required: true },
        providerUserId: { type: String, required: true },
        email: { type: String, required: false },
        connectedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  authProviders: AuthProviderInfo[];

  @Prop({ type: String, enum: Object.values(SystemRole), default: SystemRole.USER })
  systemRole: SystemRole;

  @Prop({ default: false })
  isMfaEnabled: boolean;

  @Prop({ required: false, select: false })
  mfaSecret?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', default: null })
  defaultOrganizationId?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Workspace', default: null })
  defaultWorkspaceId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Virtual for fullName
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

UserSchema.index({ 'authProviders.provider': 1, 'authProviders.providerUserId': 1 });
