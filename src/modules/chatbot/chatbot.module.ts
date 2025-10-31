import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { TenantsModule } from 'src/tenants/tenants.module';
import { ScraperService } from '../scrapper/scrapper.service';
import { ScrapperModule } from '../scrapper/scrapper.module';
import { PackageService } from '../package/package.service';
import { PlanService } from '../plan/plan.service';
import { PlanModule } from '../plan/plan.module';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [TenantsModule, ScrapperModule, PlanModule],
  providers: [
    ChatbotService,
    ScraperService,
    PackageService,
    PlanService,
    KnowledgeBaseService,
    MailerService,
  ],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
