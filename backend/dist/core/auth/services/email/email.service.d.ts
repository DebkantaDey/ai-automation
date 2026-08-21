import { ConfigService } from '@nestjs/config';
import { ConsoleEmailProvider } from './providers/console-email.provider';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
export declare class EmailService {
    private readonly configService;
    private readonly consoleProvider;
    private readonly smtpProvider;
    private readonly logger;
    private provider;
    private frontendUrl;
    constructor(configService: ConfigService, consoleProvider: ConsoleEmailProvider, smtpProvider: SmtpEmailProvider);
    sendVerificationEmail(to: string, name: string, token: string): Promise<boolean>;
    sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean>;
    sendInvitationEmail(to: string, inviterName: string, orgName: string, roleName: string, token: string): Promise<boolean>;
    sendSecurityAlertEmail(to: string, name: string, message: string): Promise<boolean>;
}
