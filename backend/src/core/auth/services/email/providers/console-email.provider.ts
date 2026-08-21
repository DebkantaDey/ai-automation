import { Injectable, Logger } from '@nestjs/common';
import { EmailMessage, EmailProviderInterface } from '../email.interface';

@Injectable()
export class ConsoleEmailProvider implements EmailProviderInterface {
  readonly providerName = 'console';
  private readonly logger = new Logger(ConsoleEmailProvider.name);

  async sendEmail(message: EmailMessage): Promise<boolean> {
    this.logger.log(
      `\n================= [TRANSACTIONAL EMAIL DISPATCH] =================\n` +
      `TO: ${message.to}\n` +
      `SUBJECT: ${message.subject}\n` +
      `CONTENT:\n${message.text || message.html}\n` +
      `===================================================================\n`,
    );
    return true;
  }
}
