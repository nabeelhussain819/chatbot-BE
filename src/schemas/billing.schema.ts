/* eslint-disable prettier/prettier */
// tenants.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Billing extends Document {
 @Prop({ required: true })
  invoiceNumber: string;

  @Prop({ required: false, default: Date.now })
  date: Date;

  @Prop({ required: true })
  amount: string;

  @Prop({ required: false, enum: ['Paid', 'Unpaid'], default: 'Paid' })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true })
  packageId: mongoose.Schema.Types.ObjectId;
}

export const BillingSchema = SchemaFactory.createForClass(Billing);
