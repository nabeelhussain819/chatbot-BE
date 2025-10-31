/* eslint-disable prettier/prettier */
// src/auth/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: false })
  tenantId: string;

  @Prop({ required: true, unique: false })
  user_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, default: false })
  googleAuth: boolean;

  @Prop({ required: false, default: false })
  is_2FA: boolean;

  @Prop({ required: false, default: true })
  email_notification: boolean;

  @Prop({ required: false, default: false })
  push_notification: boolean;

  @Prop({ required: false, default: false })
  update_notification: boolean;

  @Prop({ required: false, default: false })
  marketing_notification: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: false, default: null })
  packageId: mongoose.Schema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
