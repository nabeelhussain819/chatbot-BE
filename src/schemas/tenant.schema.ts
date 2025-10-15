/* eslint-disable prettier/prettier */
// tenants.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Tenant extends Document {
  @Prop({ required: true, unique: false })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  tenantId: string;

   @Prop({ required: true })
  dbUri: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
