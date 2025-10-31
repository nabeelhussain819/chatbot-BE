/* eslint-disable prettier/prettier */
// tenants.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Package extends Document {
  @Prop({ required: true })
  planId: string;  
  @Prop({ required: false, default: false }) is_completed: boolean;
  @Prop({ required: false, default: false }) is_active: boolean;
  @Prop({ required: false, default: false }) is_expired: boolean;
  @Prop({ required: false, default: 0 }) used_request: number;
  @Prop({ required: false, default: 0 }) total_chatbots: string;
  @Prop({ required: false, default: 0 }) total_requests: string;
  @Prop({ required: false, default: Date.now }) subscribe_at: Date;
  @Prop({ required: false, default: null }) expired_at: Date;
 @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Chatbot', default: [] })
  chatbotId: mongoose.Schema.Types.ObjectId[];
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Billing',
    required: false,
  })
  billingId: [mongoose.Schema.Types.ObjectId];
}

export const PackageSchema = SchemaFactory.createForClass(Package);
