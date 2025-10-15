import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
