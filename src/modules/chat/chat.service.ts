/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Chat } from 'src/schemas/chat.schema';

@Injectable()
export class ChatService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: { ChatModel: Model<Chat> },
  ) {}

  async getReply(message: string,tenantId: string): Promise<{ reply: string }> {
    if (!tenantId) throw new NotFoundException('Tenant ID missing');

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });

    const reply = completion.choices[0].message?.content ?? 'No response';

    await this.models.ChatModel.create({
      tenantId,
      message,
      reply,
    });

    return { reply };
  }

  async getChatHistory(tenantId: string) {
    if (!tenantId) throw new NotFoundException('Tenant ID missing');
    return this.models.ChatModel.find({ tenantId }).sort({ createdAt: -1 });
  }
}
