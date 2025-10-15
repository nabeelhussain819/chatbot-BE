/* eslint-disable prettier/prettier */
import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Chat } from 'src/schemas/chat.schema';
import { Chatbot } from 'src/schemas/chatbot.schema';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: { ChatModel?: Model<Chat>; ChatbotModel?: Model<Chatbot> },
  ) {}

  async getOverview(tenantId: string) {
    if (!this.models) {
      throw new InternalServerErrorException('Tenant models are not injected properly.');
    }

    const ChatModel = this.models.ChatModel;
    const ChatbotModel = this.models.ChatbotModel;

    if (!ChatModel || !ChatbotModel) {
      console.error('❌ Tenant models missing in DashboardService:', Object.keys(this.models || {}));
      throw new InternalServerErrorException('Chat or Chatbot model not found for this tenant.');
    }

    // Fetch metrics concurrently
    const [totalChats, chatbots, recentChats] = await Promise.all([
      ChatModel.countDocuments({ tenantId }),
      ChatbotModel.find({ tenantId }),
      ChatModel.find({ tenantId }).sort({ createdAt: -1 }).limit(4),
    ]);
    const activeChatbots = chatbots.filter((b) => b.isActive).length;
    const totalApiRequests = totalChats;
    const totalChatbots = chatbots.length;
    const lastUsedAt = recentChats[0]?.createdAt || null;
    return {
      lastUsedAt,
      apiRequests: totalApiRequests,
      totalChatbots: totalChatbots,
      activeChatbots,
      recentConversations: recentChats.map((chat) => ({
        content: chat.message,
        createdAt: chat.createdAt,
      })),
    };
  }
}
