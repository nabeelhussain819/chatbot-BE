import { Module } from '@nestjs/common';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [CardController],
  providers: [CardService],
})
export class CardModule {}
