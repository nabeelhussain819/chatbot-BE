/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TenantsModule } from 'src/tenants/tenants.module';
import { PackageController } from './package.controller';
import { PackageService } from './package.service';
import { PlanService } from '../plan/plan.service';
import { PlanModule } from '../plan/plan.module';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [TenantsModule, PlanModule],
  controllers: [PackageController],
  providers: [PackageService, PlanService, MailerService],
  exports: [PackageService],
})
export class PackageModule {}
