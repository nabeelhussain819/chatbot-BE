/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TenantsModule } from 'src/tenants/tenants.module';

@Module({
      imports: [TenantsModule],
  controllers: [DashboardController],
  providers: [DashboardService,],
})
export class DashboardModule {}
