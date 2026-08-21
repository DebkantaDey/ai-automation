import { EmailMessage, EmailProviderInterface } from '../email.interface';
export declare class ConsoleEmailProvider implements EmailProviderInterface {
    readonly providerName = "console";
    private readonly logger;
    sendEmail(message: EmailMessage): Promise<boolean>;
}
