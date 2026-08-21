import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Role {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ required: false, trim: true, default: '' })
  description: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Organization', default: null, index: true })
  organizationId?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: false, index: true })
  isSystemRole: boolean;

  @Prop({ default: true })
  isCustom: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

RoleSchema.index({ organizationId: 1, slug: 1 }, { unique: true });
