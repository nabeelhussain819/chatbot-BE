/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Tenant } from 'src/schemas/tenant.schema';

@Injectable()
export class TenantsService {
  constructor(@Inject('TENANT_MODEL') private tenantModel: Model<Tenant>) {}

  async findAll() {
    return this.tenantModel.find().exec();
  }

  async findOne(tenantId: string) {
    return this.tenantModel.findOne({ tenantId }).exec();
  }
}
