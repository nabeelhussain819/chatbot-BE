/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  async send(@Body() body: { email: string }) {
    return this.otpService.sendOtp(body.email);
  }

  @Post('verify')
  async verify(@Body() body: { email: string; otp: string }) {
    return this.otpService.verifyOtp(body.email, body.otp);
  }
}
