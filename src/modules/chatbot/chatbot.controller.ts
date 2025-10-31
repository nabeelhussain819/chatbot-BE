/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Body,
  UploadedFile,
  UseInterceptors,
  Delete,
  Param,
} from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import {
  CreateChatbotDto,
  DeleteChatbotStatusDto,
  ResubscribeChatbotDto,
  UpdateChatbotStatusDto,
} from 'src/utils/chatbot.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('/my-chatbot')
  getMyChatbot(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    const apiKey = req.headers['x-api-key'];
    return this.chatbotService.getMyChatbot(tenantId, apiKey);
  }

  @Get('getChatbotById/:id')
  getChatbotById(@Req() req, @Param('id') id: string) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.getChatbotById(id, tenantId);
  }

  @Get('/all-chatbot')
  getAllChatbot() {
    return this.chatbotService.getAllChatbot();
  }

  @Post('/create-chatbot')
  @UseInterceptors(FileInterceptor('file'))
  createChatbot(
    @Req() req,
    @Body() dto: CreateChatbotDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.createChatbot(tenantId, dto, file);
  }

  @Put('/deActiveChatbot')
  deActiveChatbot(@Req() req, @Body() dto: UpdateChatbotStatusDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.deActiveChatbot(dto, tenantId);
  }

  @Put('/activeChatbot')
  activeChatbot(@Req() req, @Body() dto: UpdateChatbotStatusDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.activeChatbot(dto, tenantId);
  }

  @Put('/reSubsribeChatbot')
  reSubsribeChatbot(@Req() req, @Body() dto: ResubscribeChatbotDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.reSubsribeChatbot(dto, tenantId);
  }
  @Delete('/deleteChatbot/:id/:planId/:knowledgeId')
  deleteChatbot(@Req() req, @Param() dto: DeleteChatbotStatusDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.deleteChatbot(dto.id, tenantId, dto.planId, dto.knowledgeId);
  }
  @Put('/updateChatbot/:id')
  @UseInterceptors(FileInterceptor('file'))
  updateChatbot(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.updateChatbot(id, dto, tenantId, file);
  }
}
