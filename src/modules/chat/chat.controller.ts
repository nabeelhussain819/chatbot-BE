/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Req } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async getChatReply( @Req() req, @Body() message: {content: string, role: string}) {
    const tenantId = req.headers['x-tenant-id'];
    const reply = await this.chatService.getReply(message.content, tenantId);
    return { role:'bot', content: reply };
  }
}
