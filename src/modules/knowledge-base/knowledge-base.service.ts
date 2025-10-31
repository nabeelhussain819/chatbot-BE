/* eslint-disable prettier/prettier */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ScraperService } from '../scrapper/scrapper.service';
import { KnowledgeBase } from 'src/schemas/knowledge.schema';
import { PDFParse } from 'pdf-parse';
import OpenAI from 'openai';
@Injectable()
export class KnowledgeBaseService {
  private openai: OpenAI;
  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: { KnowledgeBaseModel: Model<KnowledgeBase> },
    private readonly scrapperService: ScraperService,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async createOrUpdate(
    data: Partial<KnowledgeBase>,
    file?: Express.Multer.File,
  ) {
    let extractedText = '';
    let scraped = { title: '', text: '', links: [] as string[] };
    if (data.sourceUrl) {
      scraped = await this.scrapperService.scrapeWebsite(data.sourceUrl);
      extractedText = scraped.text || '';
    } else if (file) {
      if (file.mimetype === 'application/pdf') {
        const uint8Array = new Uint8Array(file.buffer);
        const pdfData = new PDFParse(uint8Array);
        const result = await pdfData.getText();
        extractedText = result.text;
      } else {
        extractedText = file.buffer.toString('utf8');
      }
    }

    const chunks = this.chunkText(extractedText, 1000);
    let embeddings: number[][] = [];
    if (data.chatbotId) {
      embeddings = extractedText ? await this.createEmbeddings(chunks) : [];
    }

    const payload = {
      ...data,
      textChunks: extractedText,
      embeddings,
      title: scraped.title || null,
      links: scraped.links || [],
      fileName: file?.originalname || null,
      fileType: file?.mimetype || null,
      chatbotId: data.chatbotId ?? [],
    };

    return this.models.KnowledgeBaseModel.findOneAndUpdate(
      { sourceUrl: data.sourceUrl || null },
      payload,
      { upsert: true, new: true },
    );
  }

  private chunkText(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async createEmbeddings(textChunks: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const chunk of textChunks) {
      const res = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });
      embeddings.push(res.data[0].embedding);
    }
    return embeddings;
  }

  async findByTenant(tenantId: string) {
    if (!this.models?.KnowledgeBaseModel)
      throw new NotFoundException(
        'KnowledgeBaseModel not initialized for tenant.',
      );

    return this.models.KnowledgeBaseModel.find({ tenantId })
      .populate('chatbotId')
      .exec();
  }

  async delete(knowledgeBaseId: string) {
    return this.models.KnowledgeBaseModel.deleteOne({ _id: knowledgeBaseId });
  }
  async updateByChatbot(body: any) {
    const checkChatbot = await this.models.KnowledgeBaseModel.find({
      _id: body.knowledgebaseId,
      chatbotId: { $in: body.chatbotId },
    });
    console.log(checkChatbot, body.chatbotId);

    if (!body.knowledgebaseId || !body.chatbotId)
      throw new NotFoundException('Not found');
    if (checkChatbot.length > 0) {
      throw new NotFoundException('Chatbot already exists');
    } else {
      await this.models.KnowledgeBaseModel.updateOne(
        { _id: body.knowledgebaseId },
        { $push: { chatbotId: body.chatbotId } },
      );
      return { message: 'Chatbot updated successfully.' };
    }
  }
  async update(knowledgeBaseId: string, body: any) {
    const data = await this.models.KnowledgeBaseModel.findOneAndUpdate(
      { _id: knowledgeBaseId },
      body,
    );
    if (!data) throw new NotFoundException('Not found');
    return { message: 'Chatbot updated successfully.' };
  }
  async addChatbot(knowledgeBaseId: any, body: any) {
    const data = await this.models.KnowledgeBaseModel.findOneAndUpdate(
      { _id: knowledgeBaseId },
      { $push: { chatbotId: body } },
      { new: true },
    );
    if (!data) throw new NotFoundException('Not found');
    return { message: 'Chatbot updated successfully.' };
  }
  async removeChatbot(knowledgeBaseId: any, body: any) {
    const data = await this.models.KnowledgeBaseModel.findOneAndUpdate(
      { _id: knowledgeBaseId },
      { $pull: { chatbotId: body } },
      { new: true },
    );
    if (!data) throw new NotFoundException('Not found');
    return { message: 'Chatbot updated successfully.' };
  }
}
