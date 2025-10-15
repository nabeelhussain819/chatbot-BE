import { Module } from '@nestjs/common';
import { UserProfileController } from './user-profile.controller';
import { UserProfileService } from './user-profile.service';
import { MailerService } from 'src/mailer/mailer.service';
import { TenantsModule } from 'src/tenants/tenants.module';
import { OtpService } from '../otp/otp.service';

@Module({
  imports: [TenantsModule],
  controllers: [UserProfileController],
  providers: [UserProfileService, OtpService, MailerService],
  exports: [UserProfileService],
})
export class UserProfileModule {}
