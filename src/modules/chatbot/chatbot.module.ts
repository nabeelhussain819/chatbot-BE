import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { TenantsModule } from 'src/tenants/tenants.module';
import { ScraperService } from '../scrapper/scrapper.service';
import { ScrapperModule } from '../scrapper/scrapper.module';

@Module({
  imports: [TenantsModule, ScrapperModule],
  providers: [ChatbotService, ScraperService],
  controllers: [ChatbotController],
})
export class ChatbotModule {}
