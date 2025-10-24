/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Req, Get} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getChatReply( @Req() req, @Body() message: {content: string, role: string}) {
    const tenantId = req.headers['x-tenant-id'];
    const apiKey = req.headers['x-api-key'];
    const reply = await this.chatService.getReply(message.content, tenantId, apiKey);
    return { role:'bot', content: reply };
  }
  @Get('/history')
  async getChatHistory(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    const history = await this.chatService.getChatHistory(tenantId);
    return history;
  }
}
