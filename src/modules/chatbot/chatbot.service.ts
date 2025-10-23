/* eslint-disable prettier/prettier */
import { Injectable, Inject, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { Chatbot } from 'src/schemas/chatbot.schema';
import { Scrapper } from 'src/schemas/scrapper.schema';
import { CreateChatbotDto, ResubscribeChatbotDto, UpdateChatbotStatusDto } from 'src/utils/chatbot.dto';
import { ScraperService } from '../scrapper/scrapper.service';
import { chunkText } from 'src/utils/text-cleaner';

@Injectable()
export class ChatbotService {
  private openai: OpenAI;
  constructor(
    private readonly ScraperService: ScraperService,
    @Inject('TENANT_MODELS')
    private readonly models: { ChatbotModel: Model<Chatbot>, ScrapperModel: Model<Scrapper> },
  ) {this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });}

  /** Get the chatbot created by the current tenant */
async getMyChatbot(tenantId: string, apiKey: string) {
  if (!tenantId) {
    throw new NotFoundException('Tenant ID missing in request');
  }

  if (!apiKey) {
    throw new NotFoundException('API key missing in request');
  }
  const chatbot = await this.models.ChatbotModel.findOne({ apiKey });

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
async createChatbot(tenantId: string,body: CreateChatbotDto) {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }
    const apiKey = randomBytes(16).toString('hex');
    const training = await this.trainFromUrl(body.url, tenantId);
    if(training.length === 0) throw new BadRequestException('No training data found.');
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

 async createEmbeddings(textChunks: string[]): Promise<number[][]> {
  if (!textChunks.length) return [];
  try {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: textChunks, 
    });
    return response.data.map((d) => d.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to create embeddings');
  }
}

  async trainFromUrl(url: string, tenantId: string) {
    const { title, text, links } = await this.ScraperService.scrapeWebsite(url);
    const chunks = chunkText(text);
    const embeddings = await this.createEmbeddings(chunks);
    await this.models.ScrapperModel.create({
      tenantId,
      url,
      title,
      text,
      links,
      embedding: embeddings.flat(),
    });
    return embeddings;
  }
}
