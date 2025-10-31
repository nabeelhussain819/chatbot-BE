/* eslint-disable prettier/prettier */
import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Connection, Model } from 'mongoose';
import OpenAI from 'openai';
import { Chatbot } from 'src/schemas/chatbot.schema';
import {
  CreateChatbotDto,
  ResubscribeChatbotDto,
  UpdateChatbotStatusDto,
} from 'src/utils/chatbot.dto';
import { KnowledgeBase } from 'src/schemas/knowledge.schema';
import { promises as fs } from 'fs';
import * as path from 'path';
import { PackageService } from '../package/package.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { MailerService } from 'src/mailer/mailer.service';
import { User, UserSchema } from 'src/schemas/user.schema';
@Injectable()
export class ChatbotService {
  private openai: OpenAI;
  constructor(
    private readonly packageService: PackageService,
    private readonly mailer: MailerService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    @Inject('TENANT_CONNECTION') private readonly tenantConnection: Connection,
    @Inject('TENANT_MODELS')
    private readonly models: {
      KnowledgeBaseModel: Model<KnowledgeBase>;
      ChatbotModel: Model<Chatbot>;
    },
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  private getUserModel(): Model<User> {
    if (this.tenantConnection.models['User']) {
      return this.tenantConnection.models['User'];
    }
    return this.tenantConnection.model<User>('User', UserSchema);
  }
  async getMyChatbot(tenantId: string, apiKey: string) {
    if (!tenantId) {
      throw new NotFoundException('Tenant ID missing in request');
    }

    if (!apiKey) {
      throw new NotFoundException('API key missing in request');
    }
    const chatbot = await this.models.ChatbotModel.findOne({ apiKey }).exec();
    const UserModel = this.getUserModel();
    const userData = await UserModel.findOne({ tenantId: tenantId });
    const pkgCheck = this.packageService.checkExpiryDate(
      chatbot?.packageId,
      tenantId,
    );
    const pkg = await pkgCheck;
    if (!chatbot) {
      throw new NotFoundException(
        'No chatbot found for this tenant or API key is incorrect',
      );
    }
    if (chatbot.tenantId !== tenantId) {
      throw new UnauthorizedException(
        'You are not authorized to access this chatbot',
      );
    }
    if (userData?.email && pkg.expired) {
      const html = `
      <h2>Your Package has Expired</h2>
      <p>Your subscription has expired. Please renew your subscription.</p></p>
      <br />
      <p>Expired at: ${new Date(pkg.expiryDate).toLocaleDateString()}</p>
    `;
      await this.mailer.sendMail(userData.email, 'Subscription Details', html);
    }

    if (!chatbot.isActive) {
      throw new BadRequestException('Chatbot is not active');
    }
    if (pkg.expired) throw new BadRequestException('Chatbot is expired');
    return {
      statusCode: 200,
      message: 'Chatbot verified successfully',
      chatbot: chatbot,
    };
  }
  async getChatbotById(id: string, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({
      _id: id,
      tenantId,
    })
      .populate(['knowledgeId', 'cardId', 'packageId'])
      .exec();
    if (!chatbot) throw new NotFoundException('Chatbot not found.');
    return chatbot;
  }

  async getAllChatbot() {
    return await this.models.ChatbotModel.find()
      .populate(['knowledgeId', 'cardId', 'packageId'])
      .exec();
  }

  async createChatbot(
    tenantId: string,
    body: CreateChatbotDto,
    file?: Express.Multer.File,
  ) {
    const apiKey = randomBytes(16).toString('hex');
    const training = await this.trainFromUrl(body.knowledgeBaseId);
    if (training.length === 0)
      throw new BadRequestException(
        'No training data found. Please Change Knowledge Base',
      );

    const avatarPath = file ? await this.uploadAvatar(file) : null;
    const chatbot = new this.models.ChatbotModel({
      tenantId,
      name: body.name,
      apiKey,
      isActive: true,
      theme: body.theme,
      default_message: body.default_message,
      sub_title: body.sub_title,
      position: body.position,
      is_avatar: body.is_avatar,
      knowledgeId: body.knowledgeBaseId,
      color: body.color,
      cardId: body.cardId,
      packageId: body.packageId,
      avatar_img: avatarPath,
      created_at: new Date(),
    });
    const plan = await this.packageService.addChatbots(
      body.packageId,
      chatbot._id,
    );
    const knowledge = await this.knowledgeBaseService.addChatbot(
      body.knowledgeBaseId,
      chatbot._id,
    );
    if (plan || knowledge) {
      await chatbot.save();
      return chatbot;
    } else {
      throw new BadRequestException('Chatbot creation failed.');
    }
  }

  async createEmbeddings(
    textChunks: string[],
    knowledgeBaseId: any,
  ): Promise<number[][]> {
    if (!textChunks.length) return [];
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: textChunks,
      });
      const existingKnowledgeBase =
        await this.models.KnowledgeBaseModel.findOne({
          _id: knowledgeBaseId,
        });
      const embeddings = response.data.map((d) => d.embedding);
      if (!existingKnowledgeBase || !existingKnowledgeBase.embeddings) {
        await this.models.KnowledgeBaseModel.updateOne(
          { _id: knowledgeBaseId },
          { $set: { embeddings } },
        );
      }
      return response.data.map((d) => d.embedding);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to create embeddings');
    }
  }

  async trainFromUrl(knowledgeBaseId: string | undefined) {
    const data = await this.models.KnowledgeBaseModel.findOne({
      _id: knowledgeBaseId,
    });
    if (!data) throw new NotFoundException('Knowledge base not found');
    const embeddings = await this.createEmbeddings(
      data.textChunks,
      knowledgeBaseId,
    );
    return embeddings;
  }
  async deActiveChatbot(body: UpdateChatbotStatusDto, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({
      _id: body.id,
      tenantId,
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');

    chatbot.isActive = false;
    await chatbot.save();

    return { message: 'Chatbot deactivated successfully.' };
  }

  async activeChatbot(body: UpdateChatbotStatusDto, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({
      _id: body.id,
      tenantId,
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');

    chatbot.isActive = true;
    await chatbot.save();

    return { message: 'Chatbot activated successfully.' };
  }
  async reSubsribeChatbot(body: ResubscribeChatbotDto, tenantId: string) {
    const chatbot = await this.models.ChatbotModel.findOne({
      _id: body.id,
      tenantId,
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');

    chatbot.subscriptionRenewedAt = new Date();
    await chatbot.save();

    return { message: 'Subscription renewed successfully.' };
  }

  async deleteChatbot(
    id: string,
    tenantId: string,
    planId: string,
    knowledgeId: string,
  ) {
    const plan = await this.packageService.removeChatbotFromPackage(planId, id);
    const knowledge = await this.knowledgeBaseService.removeChatbot(
      knowledgeId,
      id,
    );
    if (!plan || !knowledge)
      throw new BadRequestException('Chatbot deletion failed.');
    const chatbot = await this.models.ChatbotModel.findOneAndDelete({
      _id: id,
      tenantId,
    });
    if (!chatbot) throw new NotFoundException('Chatbot not found.');
    return { message: 'Chatbot deleted successfully.' };
  }
  async updateChatbot(
    id: string,
    body: any,
    tenantId: string,
    file?: Express.Multer.File,
  ) {
    const prevBot = await this.models.ChatbotModel.findOne({
      _id: id,
      tenantId,
    });

    if (prevBot?.knowledgeId !== body?.knowledgeBaseId) {
      const training = await this.trainFromUrl(body.knowledgeBaseId);
      if (training.length === 0)
        throw new BadRequestException(
          'No training data found. Please Change Knowledge Base',
        );
    }

    let avatarPath: string | null = prevBot?.avatar_img || null;

    if (file && !prevBot?.avatar_img.includes(file.originalname)) {
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
      await fs.mkdir(uploadDir, { recursive: true });

      const fileExt = path.extname(file.originalname);
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const fullPath = path.join(uploadDir, fileName);

      await fs.writeFile(fullPath, file.buffer);
      avatarPath = `/uploads/avatars/${fileName}`;
    }
    const updatedChatbot = await this.models.ChatbotModel.findOneAndUpdate(
      { _id: id, tenantId },
      { ...body, avatar_img: avatarPath },
      { new: true },
    );

    if (!updatedChatbot) throw new NotFoundException('Chatbot not found.');

    return { message: 'Chatbot updated successfully.' };
  }
  async uploadAvatar(file: Express.Multer.File) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
    await fs.mkdir(uploadDir, { recursive: true });

    console.log(uploadDir);
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const fullPath = path.join(uploadDir, fileName);

    await fs.writeFile(fullPath, file.buffer);
    return `/uploads/avatars/${fileName}`;
  }
}
