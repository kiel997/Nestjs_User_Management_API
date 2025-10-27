import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const html = `
      <p>Hello,</p>
      <p>Your password reset code is:</p>
      <h2>${otp}</h2>
      <p>This code will expire in 10 minutes.</p>
    `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp}`,
      html,
    });

    this.logger.log(`OTP email sent to ${to}`);
  }
}
