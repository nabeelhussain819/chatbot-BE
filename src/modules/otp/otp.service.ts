/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class OtpService {
  private otps = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    private readonly mailer: MailerService,
  ) {}

  async sendOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otps.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    const html = `
      <h2>Your Verification Code</h2>
      <p>Use the code below to verify your email. It will expire in 5 minutes.</p>
      <h1>${otp}</h1>
    `;
    await this.mailer.sendMail(email, 'Your OTP Code', html);
    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(email: string, otp: string) {
    const record = this.otps.get(email);
    if (!record) throw new Error('No OTP found for this email');

    if (record.expiresAt < Date.now()) {
      this.otps.delete(email);
      throw new Error('OTP expired');
    }
    if (record.otp !== otp) throw new Error('Invalid OTP');
    this.otps.delete(email);
    return true;
  }
}
