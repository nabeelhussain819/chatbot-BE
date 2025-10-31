import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { TenantsModule } from 'src/tenants/tenants.module';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [TenantsModule],
  controllers: [CardController],
  providers: [CardService, MailerService],
})
export class CardModule {}
