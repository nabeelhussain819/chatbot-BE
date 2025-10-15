/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import { Chatbot } from 'src/schemas/chatbot.schema';
import { CreateChatbotDto, ResubscribeChatbotDto, UpdateChatbotStatusDto } from 'src/utils/chatbot.dto';

@Injectable()
export class ChatbotService {
  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: { ChatbotModel: Model<Chatbot> },
  ) {}

  /** Get the chatbot created by the current tenant */
async getMyChatbot(tenantId: string, apiKey: string) {
  if (!tenantId) {
    throw new NotFoundException('Tenant ID missing in request');
  }

  if (!apiKey) {
    throw new NotFoundException('API key missing in request');
  }

  const chatbot = await this.models.ChatbotModel.findOne({ tenantId, apiKey });

  if (!chatbot) {
    throw new NotFoundException('No chatbot found for this tenant or API key is incorrect');
  }

  // Extra safety: ensure chatbot belongs to the correct tenant
  if (chatbot.tenantId !== tenantId) {
    throw new UnauthorizedException('You are not authorized to access this chatbot');
  }

  if (!chatbot.isActive) {
    throw new BadRequestException('Chatbot is not active');
  }

  return {
    statusCode: 200,
    message: 'Chatbot verified successfully',
    chatbotId: chatbot._id,
  };
}
  async getChatbotById(id: string, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({ _id: id, tenantId });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');
    return chatbot;
  }


  /** Get all chatbots across tenants (admin use) */
  async getAllChatbot() {
    return await this.models.ChatbotModel.find();
  }

  /** Create a new chatbot for this tenant */
async createChatbot(tenantId, body: CreateChatbotDto) {
    const existing = await this.models.ChatbotModel.findOne({ tenantId, name: body.name });
    if (existing) {
      throw new BadRequestException('Chatbot with this name already exists.');
    }

    const apiKey = randomBytes(16).toString('hex');

    const chatbot = new this.models.ChatbotModel({
      tenantId,
      name: body.name,
      apiKey,
      isActive: true,
      theme: body.theme,
      color: body.color,
      cardId: body.cardId,
      planId: body.planId,
      created_at: new Date(),
    });

    await chatbot.save();
    return chatbot;
  }

  /** Deactivate the chatbot */
 
async deActiveChatbot(body: UpdateChatbotStatusDto, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({ _id: body.id, tenantId });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');

    chatbot.isActive = false;
    await chatbot.save();

    return { message: 'Chatbot deactivated successfully.' };
  }
  /** Activate a chatbot (if previously deactivated) */
 
async activeChatbot(body: UpdateChatbotStatusDto, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({ _id: body.id, tenantId });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');

    chatbot.isActive = true;
    await chatbot.save();

    return { message: 'Chatbot activated successfully.' };
  }
  /** Resubscribe (renew chatbot plan or re-enable access) */
   async reSubsribeChatbot(body: ResubscribeChatbotDto, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({ _id: body.id, tenantId });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');

    chatbot.subscriptionRenewedAt = new Date();
    await chatbot.save();

    return { message: 'Subscription renewed successfully.' };
  }
}
