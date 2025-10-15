/* eslint-disable prettier/prettier */
import { Controller, Get, Req } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Req() req) {
    const tenantId = req.headers['x-tenant-id'] as string;
    return this.dashboardService.getOverview(tenantId);
  }
}
