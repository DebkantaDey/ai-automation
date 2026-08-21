import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import axios from 'axios';
import * as crypto from 'crypto';
import { QUEUE_WEBHOOK_DISPATCH } from '../../../core/queue/queue.constants';
import { WebhookDelivery, WebhookDeliveryDocument } from '../schemas/webhook-delivery.schema';

export interface WebhookDispatchJobData {
  organizationId: string;
  workspaceId: string;
  endpointId: string;
  url: string;
  secret: string;
  eventId: string;
  eventType: string;
  payload: Record<string, any>;
}

@Processor(QUEUE_WEBHOOK_DISPATCH)
export class WebhookDispatchProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDispatchProcessor.name);

  constructor(
    @InjectModel(WebhookDelivery.name)
    private readonly deliveryModel: Model<WebhookDeliveryDocument>,
  ) {
    super();
  }

  async process(job: Job<WebhookDispatchJobData>): Promise<any> {
    const { organizationId, workspaceId, endpointId, url, secret, eventId, eventType, payload } = job.data;
    const attempt = job.attemptsMade + 1;

    const timestamp = Math.floor(Date.now() / 1000);
    const serializedPayload = JSON.stringify(payload);
    const signaturePayload = `${timestamp}.${serializedPayload}`;
    const hmac = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
    const signatureHeader = `t=${timestamp},v1=${hmac}`;

    const startTime = Date.now();
    let httpStatusCode = 0;
    let responseBody = '';
    let status: 'delivered' | 'failed' | 'retrying' = 'delivered';
    let errorMsg: string | undefined;

    try {
      this.logger.log(`Dispatching webhook [${eventType}] to [${url}] (Attempt ${attempt})`);

      const res = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AutomationSaaS-Webhook/1.0',
          'X-Webhook-Signature': signatureHeader,
          'X-Webhook-Event': eventType,
          'X-Webhook-Id': eventId,
          'X-Webhook-Timestamp': String(timestamp),
        },
        timeout: 10000,
      });

      httpStatusCode = res.status;
      responseBody = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      status = 'delivered';
    } catch (err: any) {
      httpStatusCode = err.response?.status || 500;
      responseBody = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : '';
      errorMsg = err.message;
      status = attempt >= (job.opts.attempts || 5) ? 'failed' : 'retrying';

      this.logger.warn(`Webhook delivery failed for [${url}]: ${err.message} (HTTP ${httpStatusCode})`);
    } finally {
      const durationMs = Date.now() - startTime;

      await this.deliveryModel.create({
        organizationId: new Types.ObjectId(organizationId),
        workspaceId: new Types.ObjectId(workspaceId),
        endpointId: new Types.ObjectId(endpointId),
        eventId,
        eventType,
        payload,
        status,
        attempts: attempt,
        httpStatusCode,
        responseBody: responseBody.slice(0, 1000), // Cap response body at 1KB
        durationMs,
        error: errorMsg,
        nextRetryAt: status === 'retrying' ? new Date(Date.now() + Math.pow(2, attempt) * 1000) : null,
      });

      if (status !== 'delivered') {
        throw new Error(`Webhook dispatch failed with HTTP ${httpStatusCode}: ${errorMsg}`);
      }
    }
  }
}
