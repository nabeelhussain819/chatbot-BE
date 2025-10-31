import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TenantsModule } from 'src/tenants/tenants.module';
import { PackageService } from '../package/package.service';
import { PlanModule } from '../plan/plan.module';
import { ChatbotService } from '../chatbot/chatbot.service';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { ScraperService } from '../scrapper/scrapper.service';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [TenantsModule, PlanModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    PackageService,
    ChatbotService,
    KnowledgeBaseService,
    ScraperService,
    MailerService,
  ],
})
export class ChatModule {}
