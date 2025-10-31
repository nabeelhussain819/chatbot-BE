/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantsModule } from './tenants/tenants.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { CardModule } from './modules/card/card.module';
import { MailerService } from './mailer/mailer.service';
import { OtpService } from './modules/otp/otp.service';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';
import { OtpModule } from './modules/otp/otp.module';
import { ChatModule } from './modules/chat/chat.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PlanModule } from './modules/plan/plan.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { ScraperService } from './modules/scrapper/scrapper.service';
import { ScrapperModule } from './modules/scrapper/scrapper.module';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module';
import { BillingModule } from './modules/billing/billing.module';
import { PackageService } from './modules/package/package.service';
import { PackageController } from './modules/package/package.controller';
import { PackageModule } from './modules/package/package.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ChatModule,
    AuthModule,
    TenantsModule,
    MongooseModule.forRoot('mongodb://localhost:27017/tenant-auth'),
    UserProfileModule,
    CardModule,
    OtpModule,
    DashboardModule,
    PlanModule,
    ChatbotModule,
    ScrapperModule,
    KnowledgeBaseModule,
    BillingModule,
    PackageModule,
     ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',  // This will serve images at /uploads URL
    }),
  ],
  controllers: [AppController, AuthController, PackageController],
  providers: [AppService, AuthService, OtpService, MailerService, ScraperService, PackageService],
  exports: [MongooseModule],
})
export class AppModule {}
