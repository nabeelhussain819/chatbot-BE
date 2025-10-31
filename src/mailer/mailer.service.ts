/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // or your SMTP provider
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER, // e.g. your Gmail
        pass: process.env.MAIL_PASS, // app password
      },
    });
  }

  async sendMail(to: string, subject: string, html: string) {
    await this.transporter.sendMail({
      from: `"AfterShock AI" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  }
}
