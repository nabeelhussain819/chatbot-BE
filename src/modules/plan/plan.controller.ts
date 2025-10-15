/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Req } from '@nestjs/common';
import { PlanService } from './plan.service';

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  async getPlans() {
    return this.planService.getPlans();
  }

  @Get('get-plan/:plan')
  async getPlanById(@Param('plan') name: string) {
    return this.planService.getPlanByName(name);
  }
}
