/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import {  MongooseModule } from '@nestjs/mongoose';
import { TenantsService } from './tenants.service';
import { TenantConnectionService } from './tenant-connection.service';
import { TenantModelProvider } from './tenant-model.provider';
import { TenantSchema } from 'src/schemas/tenant.schema';
import { TenantConnectionProvider } from './tenant-connection.provider';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tenant', schema: TenantSchema }]),
  ],
  providers: [
    TenantsService,
    TenantConnectionService,
    TenantModelProvider,
    { provide: 'TENANT_MODEL', useExisting: 'TenantModel' },TenantConnectionProvider
  ],
  exports: [TenantModelProvider, TenantConnectionService, TenantsService,TenantConnectionProvider],
 
})
export class TenantsModule {}
