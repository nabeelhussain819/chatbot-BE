import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MailerService } from 'src/mailer/mailer.service';

@Module({
  imports: [],
  providers: [OtpService, MailerService],
  controllers: [OtpController],
})
export class OtpModule {}
