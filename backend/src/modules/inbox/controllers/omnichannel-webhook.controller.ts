import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WhatsAppService } from '../services/whatsapp.service';
import { EmailChannelService } from '../services/email-channel.service';
import { InboxService } from '../services/inbox.service';
import { Public } from '../../../core/tenancy/tenant.decorators';

@ApiTags('Omnichannel Inbound Webhooks')
@Controller('webhooks/omnichannel')
export class OmnichannelWebhookController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly emailService: EmailChannelService,
    private readonly inboxService: InboxService,
  ) {}

  @Public()
  @Get('whatsapp')
  @ApiOperation({ summary: 'Meta WhatsApp webhook verification challenge' })
  verifyWhatsApp(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappService.verifyWebhook(mode, token, challenge);
  }

  @Public()
  @Post('whatsapp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Meta WhatsApp inbound webhook message receiver' })
  async handleWhatsAppInbound(
    @Body() body: any,
    @Headers('x-organization-id') orgIdHeader?: string,
  ) {
    const orgId = orgIdHeader || body?.organizationId || 'default-org';
    const parsedMessages = this.whatsappService.parseInboundWebhook(body);

    for (const msg of parsedMessages) {
      await this.inboxService.processInboundMessage(orgId, {
        channel: 'whatsapp',
        senderIdentifier: msg.from,
        senderName: msg.senderName,
        content: msg.text || '[Media Attachment]',
        externalMessageId: msg.messageId,
        rawPayload: msg.rawPayload,
      });
    }

    return { status: 'EVENT_RECEIVED' };
  }

  @Public()
  @Post('email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inbound Email webhook receiver' })
  async handleEmailInbound(
    @Body() body: any,
    @Headers('x-organization-id') orgIdHeader?: string,
  ) {
    const orgId = orgIdHeader || body?.organizationId || 'default-org';
    const parsed = this.emailService.parseInboundEmail(body);

    await this.inboxService.processInboundMessage(orgId, {
      channel: 'email',
      senderIdentifier: parsed.fromEmail,
      senderName: parsed.fromName,
      content: `${parsed.subject ? `Subject: ${parsed.subject}\n\n` : ''}${parsed.text}`,
      externalMessageId: parsed.messageId,
      rawPayload: parsed.rawPayload,
    });

    return { status: 'EMAIL_RECEIVED' };
  }
}
