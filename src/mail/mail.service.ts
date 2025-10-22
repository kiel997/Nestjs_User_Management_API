import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const hasMailConfig =
      process.env.MAIL_HOST &&
      process.env.MAIL_USER &&
      process.env.MAIL_PASS;

    if (hasMailConfig) {
      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT ?? '587', 10),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });
      this.logger.log(' Mail transporter configured successfully.');
    } else {
      this.logger.warn(' No mail configuration found — emails will only log to console.');
    }
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    if (!this.transporter) {
      this.logger.log(` Mock Email: To=${to}, Subject=${subject}`);
      this.logger.log(`Message: ${text}`);
      return;
    }

    
    const info = await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    this.logger.log(` Email sent to ${to} (ID: ${info.messageId})`);
  }
}
