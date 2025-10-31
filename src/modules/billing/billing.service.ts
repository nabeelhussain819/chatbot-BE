/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { Billing } from 'src/schemas/billing.schema';

@Injectable()
export class BillingService {
  constructor(
    @Inject('TENANT_MODELS')
    private readonly models: {
      BillingModel: Model<Billing>;
    },
  ) {}
  async getBillingHistory() {
    return this.models.BillingModel.find().populate('packageId').exec();
  }
}
