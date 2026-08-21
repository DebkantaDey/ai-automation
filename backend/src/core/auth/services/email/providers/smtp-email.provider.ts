import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailMessage, EmailProviderInterface } from '../email.interface';

@Injectable()
export class SmtpEmailProvider implements EmailProviderInterface {
  readonly providerName = 'smtp';
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;
  private readonly logger = new Logger(SmtpEmailProvider.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('EMAIL_HOST') || process.env.EMAIL_HOST;
    const port = parseInt(this.configService.get<string>('EMAIL_PORT') || process.env.EMAIL_PORT || '587', 10);
    const user = this.configService.get<string>('EMAIL_USER') || process.env.EMAIL_USER;
    const pass = this.configService.get<string>('EMAIL_PASSWORD') || process.env.EMAIL_PASSWORD;
    this.fromAddress = this.configService.get<string>('EMAIL_FROM') || process.env.EMAIL_FROM || 'noreply@automa.ai';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async sendEmail(message: EmailMessage): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`SMTP credentials not configured. Falling back to logger.`);
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      });
      return true;
    } catch (error: any) {
      this.logger.error(`Failed to send email via SMTP: ${error.message}`);
      return false;
    }
  }
}
