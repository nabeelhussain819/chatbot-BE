/* eslint-disable prettier/prettier */
// tenants.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Card extends Document {
  @Prop({ required: true })
  card_holder: string;

  @Prop({ required: true, unique: true })
  card_number: string;

  @Prop({ required: true })
  expiry_date: string;

  @Prop({ required: true, unique: true })
  cvv: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  zip_code: string;

  @Prop({ required: true })
  tenantId: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
