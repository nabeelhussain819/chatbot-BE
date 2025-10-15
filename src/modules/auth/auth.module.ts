/* eslint-disable prettier/prettier */
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Tenant, TenantSchema } from 'src/schemas/tenant.schema';
import { PassportModule } from '@nestjs/passport';
import { MailerService } from 'src/mailer/mailer.service';
import { TenantsModule } from 'src/tenants/tenants.module';
import { OtpService } from '../otp/otp.service';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    MongooseModule.forFeature([
      { name: Tenant.name, schema: TenantSchema },
    ]),TenantsModule
  ],
  providers: [AuthService, OtpService, MailerService,  ],
  controllers: [AuthController],
  exports: [MongooseModule, ],
})
export class AuthModule {}
