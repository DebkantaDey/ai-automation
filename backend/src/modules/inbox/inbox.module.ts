import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Customer, CustomerSchema } from '../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivitySchema } from '../crm/schemas/customer-activity.schema';
import { InboxService } from './services/inbox.service';
import { WhatsAppService } from './services/whatsapp.service';
import { EmailChannelService } from './services/email-channel.service';
import { AiReplyGeneratorService } from './services/ai-reply-generator.service';
import { InboxController } from './controllers/inbox.controller';
import { OmnichannelWebhookController } from './controllers/omnichannel-webhook.controller';
import { AiModule } from '../../integrations/ai/ai.module';
import { EventsModule } from '../../core/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerActivity.name, schema: CustomerActivitySchema },
    ]),
    AiModule,
    EventsModule,
  ],
  controllers: [InboxController, OmnichannelWebhookController],
  providers: [
    InboxService,
    WhatsAppService,
    EmailChannelService,
    AiReplyGeneratorService,
  ],
  exports: [
    InboxService,
    WhatsAppService,
    EmailChannelService,
    AiReplyGeneratorService,
  ],
})
export class InboxModule {}
