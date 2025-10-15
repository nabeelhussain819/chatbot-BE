/* eslint-disable prettier/prettier */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { OtpService } from '../otp/otp.service';

@Injectable()
export class UserProfileService {
  constructor(
    @Inject('TENANT_CONNECTION') private readonly tenantConnection: Connection,
    private readonly otpService: OtpService,
  ) {}

  /** Utility: safely get tenant’s User model */
  private getUserModel(): Model<User> {
    if (this.tenantConnection.models['User']) {
      return this.tenantConnection.models['User'];
    }
    return this.tenantConnection.model<User>('User', UserSchema);
  }

  async getUserProfile(tenantId: string) {
    const UserModel = this.getUserModel();
    const user = await UserModel.findOne({ tenantId }).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getNotifications(tenantId: string) {
    const UserModel = this.getUserModel();
    const notification = await UserModel.findOne({ tenantId });
    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async updateProfile(body: { name?: string; email: string }) {
    const UserModel = this.getUserModel();
    const user = await UserModel.findOneAndUpdate(
      { email: body.email },
      { $set: body },
      { new: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Profile updated successfully' };
  }

  async updateNotification(body: {
    tenantId: string;
    email_notification?: boolean;
    push_notification?: boolean;
    update_notification: boolean;
    marketing_notification: boolean;
  }) {
    const UserModel = this.getUserModel();
    await UserModel.findOneAndUpdate(
      { tenantId: body.tenantId },
      { $set: body },
      { new: true },
    );
    return { message: 'Notification updated successfully' };
  }

  async updatePassword(body: {
    email: string;
    oldPassword: string;
    newPassword: string;
    otp: string;
  }) {
    const UserModel = this.getUserModel();
    const isValidOTP = await this.otpService.verifyOtp(body.email, body.otp);
    if (!isValidOTP) throw new Error('Invalid OTP');

    const { email, oldPassword, newPassword } = body;
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error('Old password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async update2FA(body: { email: string; otp: string }) {
    const UserModel = this.getUserModel();
    const isValidOTP = await this.otpService.verifyOtp(body.email, body.otp);
    if (!isValidOTP) throw new Error('Invalid OTP');

    const user = await UserModel.findOne({ email: body.email });
    if (!user) throw new Error('User not found');

    user.is_2FA = true;
    await user.save();

    return { message: '2FA updated successfully' };
  }

}
