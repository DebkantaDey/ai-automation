import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type AuthTokenType = 'email_verification' | 'password_reset';

export type AuthTokenDocument = AuthToken & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class AuthToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  tokenHash: string;

  @Prop({
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true,
    index: true,
  })
  type: AuthTokenType;

  @Prop({ default: false, index: true })
  isUsed: boolean;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: null })
  usedAt?: Date;

  createdAt: Date;
}

export const AuthTokenSchema = SchemaFactory.createForClass(AuthToken);
AuthTokenSchema.index({ userId: 1, type: 1, isUsed: 1 });
AuthTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
