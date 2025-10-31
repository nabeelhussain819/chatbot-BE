/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Chat } from 'src/schemas/chat.schema';
import { Chatbot } from 'src/schemas/chatbot.schema';
import { KnowledgeBase } from 'src/schemas/knowledge.schema';
import { PackageService } from '../package/package.service';

@Injectable()
export class ChatService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  constructor(
    private readonly packageService: PackageService,
    @Inject('TENANT_MODELS')
    private readonly models: {
      ChatModel: Model<Chat>;
      KnowledgeBaseModel: Model<KnowledgeBase>;
      ChatbotModel: Model<Chatbot>;
    },
  ) {}

  async getReply(
    message: string,
    tenantId: string,
    apiKey: string,
  ): Promise<{ reply: string }> {
    if (!tenantId) throw new NotFoundException('Tenant ID missing');
    const chatbot = await this.models.ChatbotModel.findOne({ apiKey });
    if (!chatbot) throw new NotFoundException('Chatbot not found');
    const pkgCount = await this.packageService.checkTotalReq(chatbot._id)
    const chats = await this.models.ChatModel.find({chatbotId: chatbot._id});
    if(Number(pkgCount) <= chats.length) return {reply: 'You have reached the limit of requests'};
    const increaseReq = await this.packageService.addRequest(chatbot._id);
    const knowledgeBase = await this.models.KnowledgeBaseModel.find({
      tenantId,
    })
      .limit(5)
      .lean();
    const scoredPages = knowledgeBase
      .map((page) => {
        const text = page.textChunks.join(' ').toLowerCase();
        const score = message
          .toLowerCase()
          .split(' ')
          .reduce((acc, word) => (text.includes(word) ? acc + 1 : acc), 0);
        return { ...page, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = scoredPages
      .map(
        (p) => `
### Source: ${p.title ?? 'Untitled Page'}
${p.sourceUrl ? `URL: ${p.sourceUrl}\n` : ''}
${p.textChunks.slice(0, 2000).join('\n')}
`,
      )
      .join('\n\n---\n\n');
    const messages = [
      {
        role: 'system',
        content: `
You are a knowledgeable and context-aware assistant.
You must answer *only* based on the provided knowledge base content.
If the answer is not in the context, say "I don’t have enough information on that."
Always include specific, accurate, and human-friendly responses.
When referencing something from the context, infer meaning but never fabricate data.
    `,
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${message}`,
      },
    ];
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages as any,
    });

    const reply = completion.choices[0].message?.content ?? 'No response';

    await this.models.ChatModel.create({
      tenantId,
      message,
      reply,
      chatbotId: chatbot._id,
    });

    return { reply };
  }

  async getChatHistory(tenantId: string) {
    if (!tenantId) throw new NotFoundException('Tenant ID missing');
    const chats = await this.models.ChatModel.find({ tenantId })
      .populate('chatbotId')
      .sort({ createdAt: -1 })
      .exec();

    return chats;
  }
}
