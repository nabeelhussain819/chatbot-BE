/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Chat } from 'src/schemas/chat.schema';
import { Chatbot } from 'src/schemas/chatbot.schema';
import { Scrapper } from 'src/schemas/scrapper.schema';

@Injectable()
export class ChatService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: { ChatModel: Model<Chat>, ScrapperModel: Model<Scrapper>, ChatbotModel: Model<Chatbot> },
  ) {}

  async getReply(message: string,tenantId: string, apiKey: string): Promise<{ reply: string }> {
    if (!tenantId) throw new NotFoundException('Tenant ID missing'); 
    const chatbot = await this.models.ChatbotModel.findOne({ apiKey });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    
    const pages = await this.models.ScrapperModel.find({ tenantId }).limit(5).lean();
    const context = pages.map(p => p.text.slice(0, 1000)).join('\n\n');
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
       messages: [
        { role: 'system', content: 'You are a helpful assistant answering based on website data.' },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${message}` },
      ],
    });

    const reply = completion.choices[0].message?.content ?? 'No response';

    await this.models.ChatModel.create({
      tenantId,
      message,
      reply,
      chatbotId: chatbot._id
    });

    return { reply };
  }

  async getChatHistory(tenantId: string) {
if (!tenantId) throw new NotFoundException('Tenant ID missing');
  const chats = await this.models.ChatModel
    .find({ tenantId })
    .populate('chatbotId')
    .sort({ createdAt: -1 })
    .exec();

  return chats;
  }
  
}
