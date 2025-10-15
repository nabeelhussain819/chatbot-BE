import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  providers: [ChatbotService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
