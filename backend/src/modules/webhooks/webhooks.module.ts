import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookDispatchProcessor } from './processors/webhook-dispatch.processor';
import { WebhookEndpoint, WebhookEndpointSchema } from './schemas/webhook-endpoint.schema';
import { WebhookDelivery, WebhookDeliverySchema } from './schemas/webhook-delivery.schema';
import { QUEUE_WEBHOOK_DISPATCH } from '../../core/queue/queue.constants';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WebhookEndpoint.name, schema: WebhookEndpointSchema },
      { name: WebhookDelivery.name, schema: WebhookDeliverySchema },
    ]),
    BullModule.registerQueue({
      name: QUEUE_WEBHOOK_DISPATCH,
    }),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhookDispatchProcessor],
  exports: [WebhooksService, MongooseModule],
})
export class WebhooksModule {}
