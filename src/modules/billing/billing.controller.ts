/* eslint-disable prettier/prettier */
import { Controller, Get } from '@nestjs/common';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}
  @Get("/all")
  async getBilling() {
    return this.billingService.getBillingHistory();
  }
}
