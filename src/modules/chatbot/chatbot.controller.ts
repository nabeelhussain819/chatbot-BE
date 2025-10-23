/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Req, Body, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CreateChatbotDto, ResubscribeChatbotDto, UpdateChatbotStatusDto } from 'src/utils/chatbot.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('/my-chatbot')
  getMyChatbot(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    const apiKey = req.headers['x-api-key'];
    return this.chatbotService.getMyChatbot(tenantId, apiKey);
  }

 @Get('getChatbotById')
getChatbotById(@Req() req, @Query('id') id: string) {
  const tenantId = req.headers['x-tenant-id'];
  return this.chatbotService.getChatbotById(id, tenantId);
}

  @Get('/all-chatbot')
  getAllChatbot() {
    return this.chatbotService.getAllChatbot();
  }

   @Post('/create-chatbot')
  createChatbot(@Req() req,@Body() dto: CreateChatbotDto) {
  const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.createChatbot(tenantId, dto);
  }

  @Put('/deActiveChatbot')
  deActiveChatbot(@Req() req,@Body() dto: UpdateChatbotStatusDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.deActiveChatbot(dto, tenantId);
  }

  @Put('/activeChatbot')
  activeChatbot(@Req() req,@Body() dto: UpdateChatbotStatusDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.activeChatbot(dto, tenantId);
  }

  @Put('/reSubsribeChatbot')
  reSubsribeChatbot(@Req() req, @Body() dto: ResubscribeChatbotDto) {
    const tenantId = req.headers['x-tenant-id'];
    return this.chatbotService.reSubsribeChatbot(dto, tenantId);
  }
}
