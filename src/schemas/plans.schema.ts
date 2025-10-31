/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Plan extends Document {
  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  duration: string;

  @Prop({ required: false })
  price: string;

  @Prop({ required: false })
  cta: string;

  @Prop({ required: false })
  features: Array<string>;

  @Prop({ required: false, default: true })
  default: boolean;

  @Prop({ required: false })
  total_chatbot: string;

   @Prop({ required: false })
  total_request: string;

}

export const PlanSchema = SchemaFactory.createForClass(Plan);
