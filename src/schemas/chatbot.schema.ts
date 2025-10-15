/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Chatbot extends Document {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  apiRequests: number;

  @Prop({ default: 0 })
  totalConversations: number;

  @Prop({ default: 0 })
  avgResponseTime: number;

  @Prop({ required: true })
  apiKey: string;

  @Prop({ required: false, default: 'light' })
  theme: string;

  @Prop({ required: false, default: '#000000' })
  color: string;

  @Prop({ required: false })
  created_at: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true })
  cardId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true })
  planId: mongoose.Schema.Types.ObjectId;

  @Prop() subscriptionRenewedAt?: Date;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
