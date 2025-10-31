/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Chatbot extends Document {
  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;
   @Prop({ required: true })
  sub_title: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ required: true })
  default_message: string;

 @Prop({ required: true })
  position: string;

   @Prop({ required: true })
  avatar_img: string;

   @Prop({ required: true })
  is_avatar: boolean;

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

  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeBase', required: true })
  knowledgeId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true })
  packageId: mongoose.Schema.Types.ObjectId;

  @Prop() subscriptionRenewedAt?: Date;
}

export const ChatbotSchema = SchemaFactory.createForClass(Chatbot);
