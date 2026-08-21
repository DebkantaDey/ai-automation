import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { OrganizationRole } from '../../../core/common/enums/role.enum';

export type OrganizationMemberStatus = 'active' | 'invited' | 'suspended';

export type OrganizationMemberDocument = OrganizationMember & Document;

@Schema({ timestamps: true })
export class OrganizationMember {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', required: true, index: true })
  organizationId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(OrganizationRole), default: OrganizationRole.MEMBER })
  role: OrganizationRole;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Role', default: null })
  roleId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['active', 'invited', 'suspended'],
    default: 'active',
    index: true,
  })
  status: OrganizationMemberStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', default: null })
  invitedBy?: Types.ObjectId;

  @Prop({ default: Date.now })
  joinedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const OrganizationMemberSchema = SchemaFactory.createForClass(OrganizationMember);
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
OrganizationMemberSchema.index({ userId: 1, status: 1 });
