/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post,  Req } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { OtpService } from '../otp/otp.service';
@Controller('user')
export class UserProfileController {
  constructor(private readonly UserProfileService: UserProfileService, private readonly otpService: OtpService) {}
  @Get('profile')
  async getUserProfile(@Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    return this.UserProfileService.getUserProfile(tenantId);
  }

 
  @Post('update')
  async updateProfile(
    @Body()
    body: {
      name?: string;
      email: string;
      email_notification?: string;
      push_notification?: string;
      update_notification: string;
      marketing_notification: string;
    },
  ) {
    return this.UserProfileService.updateProfile(body);
  }
  @Post('change-password')
  async changePassword(
    @Body() body: { email: string; oldPassword: string; newPassword: string ;otp: string},
  ) {
    return this.UserProfileService.updatePassword(body);
  }
  @Post('update-notification')
  async updateNotification(
    @Req() req,
    @Body()
    body: {
      email_notification?: boolean;
      push_notification?: boolean;
      update_notification: boolean;
      marketing_notification: boolean;
    },
  ) {
    const tenantId = req.headers['x-tenant-id'];
    const payload = { ...body, tenantId };
    return this.UserProfileService.updateNotification(payload);
  }
  @Post('otp-send')
  async send(@Body() body: { email: string }) {
    return this.otpService.sendOtp(body.email);
  }
  @Post('2fa-enable')
  async enable2FA(@Body() body: { email: string; otp: string }) {
    return this.UserProfileService.update2FA(body);
  }

 
}
