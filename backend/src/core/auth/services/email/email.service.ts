import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConsoleEmailProvider } from './providers/console-email.provider';
import { SmtpEmailProvider } from './providers/smtp-email.provider';
import { EmailProviderInterface } from './email.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private provider: EmailProviderInterface;
  private frontendUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly consoleProvider: ConsoleEmailProvider,
    private readonly smtpProvider: SmtpEmailProvider,
  ) {
    this.frontendUrl = this.configService.get<string>('app.frontendUrl') || process.env.FRONTEND_URL || 'http://localhost:3000';
    const emailHost = this.configService.get<string>('EMAIL_HOST') || process.env.EMAIL_HOST;

    if (emailHost) {
      this.provider = this.smtpProvider;
    } else {
      this.provider = this.consoleProvider;
    }
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
    const verifyUrl = `${this.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">Verify your AutomaAI Account</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for creating an account on the AutomaAI platform. Please click the button below to verify your email address and activate your organization workspace.</p>
        <div style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">If you did not register for an account, you can safely ignore this email.</p>
        <p style="font-size: 11px; color: #9ca3af; word-break: break-all;">Link: ${verifyUrl}</p>
      </div>
    `;

    return this.provider.sendEmail({
      to,
      subject: 'Verify your email address - AutomaAI SaaS',
      html,
      text: `Hello ${name}, please verify your email by opening: ${verifyUrl}`,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">Reset your AutomaAI Password</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset the password for your AutomaAI account. Click the button below to set a new password. This link is valid for 1 hour.</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">If you did not request a password reset, please contact security immediately.</p>
        <p style="font-size: 11px; color: #9ca3af; word-break: break-all;">Link: ${resetUrl}</p>
      </div>
    `;

    return this.provider.sendEmail({
      to,
      subject: 'Reset your password - AutomaAI SaaS',
      html,
      text: `Hello ${name}, reset your password at: ${resetUrl}`,
    });
  }

  async sendInvitationEmail(to: string, inviterName: string, orgName: string, roleName: string, token: string): Promise<boolean> {
    const acceptUrl = `${this.frontendUrl}/accept-invite?token=${token}&email=${encodeURIComponent(to)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 16px;">Invitation to join ${orgName}</h2>
        <p>Hello,</p>
        <p><strong>${inviterName}</strong> has invited you to collaborate on <strong>${orgName}</strong> on the AutomaAI platform as a <strong>${roleName}</strong>.</p>
        <div style="margin: 24px 0;">
          <a href="${acceptUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Accept Invitation & Join Team
          </a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">This invitation is single-use and will expire in 7 days.</p>
        <p style="font-size: 11px; color: #9ca3af; word-break: break-all;">Link: ${acceptUrl}</p>
      </div>
    `;

    return this.provider.sendEmail({
      to,
      subject: `You've been invited to join ${orgName} on AutomaAI`,
      html,
      text: `Hello, ${inviterName} invited you to join ${orgName} as ${roleName}. Accept at: ${acceptUrl}`,
    });
  }

  async sendSecurityAlertEmail(to: string, name: string, message: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #dc2626; margin-bottom: 16px;">Security Alert - AutomaAI</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>${message}</p>
        <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">If this was you, you can ignore this notice. Otherwise, please reset your password immediately.</p>
      </div>
    `;

    return this.provider.sendEmail({
      to,
      subject: 'Security Alert - AutomaAI',
      html,
      text: `Security Alert: ${message}`,
    });
  }
}
