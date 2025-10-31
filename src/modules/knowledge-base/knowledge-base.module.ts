/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { TenantsModule } from 'src/tenants/tenants.module';
import { ScraperService } from '../scrapper/scrapper.service';

@Module({
  imports: [TenantsModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService, ScraperService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
