/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Scrapper extends Document {
  @Prop({ required: true }) tenantId: string;
  @Prop({ required: true }) url: string;
  @Prop() title: string;
  @Prop() text: string;
  @Prop({ type: [String], default: [] }) links: string[];
  @Prop({ type: [Number], default: [] }) embedding?: number[];
}

export const ScrapperSchema = SchemaFactory.createForClass(Scrapper);
