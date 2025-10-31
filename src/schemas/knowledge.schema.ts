/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class KnowledgeBase extends Document {

 @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'Chatbot', default: [] })
   chatbotId: mongoose.Schema.Types.ObjectId[];

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  sourceType?: 'website' | 'file';

  @Prop({ required: true })
  sourceUrl: string;

  @Prop()
  fileName?: string;

  @Prop()
  filePath?: string;

  @Prop()
  mimeType?: string;

  @Prop({ type: [String], default: [] })
  textChunks: string[];

  @Prop() title: string;
  
  @Prop({ type: [String], default: [] }) links: string[];

  @Prop({ type: [[Number]], default: [] })
  embeddings: number[][];

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const KnowledgeBaseSchema = SchemaFactory.createForClass(KnowledgeBase);
