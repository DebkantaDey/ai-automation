export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProviderInterface {
  readonly providerName: string;
  sendEmail(message: EmailMessage): Promise<boolean>;
}
