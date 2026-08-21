import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import { WebhookEndpoint, WebhookEndpointDocument } from './schemas/webhook-endpoint.schema';
import { WebhookDelivery, WebhookDeliveryDocument } from './schemas/webhook-delivery.schema';
import { QUEUE_WEBHOOK_DISPATCH } from '../../core/queue/queue.constants';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

export interface CreateWebhookEndpointDto {
  url: string;
  eventTypes?: string[];
  description?: string;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    @InjectModel(WebhookEndpoint.name)
    private readonly endpointModel: Model<WebhookEndpointDocument>,
    @InjectModel(WebhookDelivery.name)
    private readonly deliveryModel: Model<WebhookDeliveryDocument>,
    @InjectQueue(QUEUE_WEBHOOK_DISPATCH)
    private readonly webhookQueue: Queue,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createEndpoint(
    organizationId: string,
    workspaceId: string,
    userId: string,
    dto: CreateWebhookEndpointDto,
  ): Promise<WebhookEndpointDocument> {
    if (!dto.url || !dto.url.startsWith('http')) {
      throw new BadRequestException('A valid HTTP/HTTPS endpoint URL is required');
    }

    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const endpoint = new this.endpointModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      url: dto.url,
      secret,
      eventTypes: dto.eventTypes && dto.eventTypes.length > 0 ? dto.eventTypes : ['*'],
      description: dto.description || '',
      status: 'active',
      createdBy: this.toObjectId(userId),
    });

    return endpoint.save();
  }

  async listEndpoints(organizationId: string, workspaceId: string) {
    return this.endpointModel
      .find({
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getEndpointById(id: string, organizationId: string, workspaceId: string): Promise<WebhookEndpointDocument> {
    const endpoint = await this.endpointModel.findOne({
      _id: this.toObjectId(id),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return endpoint;
  }

  async updateEndpoint(
    id: string,
    organizationId: string,
    workspaceId: string,
    updates: Partial<CreateWebhookEndpointDto> & { status?: string },
  ): Promise<WebhookEndpointDocument> {
    const endpoint = await this.endpointModel.findOneAndUpdate(
      {
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      },
      { $set: updates },
      { new: true },
    );

    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return endpoint;
  }

  async rotateSecret(id: string, organizationId: string, workspaceId: string): Promise<WebhookEndpointDocument> {
    const newSecret = `whsec_${crypto.randomBytes(24).toString('hex')}`;
    const endpoint = await this.endpointModel.findOneAndUpdate(
      {
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      },
      { $set: { secret: newSecret } },
      { new: true },
    );

    if (!endpoint) {
      throw new NotFoundException('Webhook endpoint not found');
    }
    return endpoint;
  }

  async deleteEndpoint(id: string, organizationId: string, workspaceId: string): Promise<void> {
    const res = await this.endpointModel.deleteOne({
      _id: this.toObjectId(id),
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    });

    if (res.deletedCount === 0) {
      throw new NotFoundException('Webhook endpoint not found');
    }
  }

  async dispatchOutboundEvent(
    organizationId: string,
    workspaceId: string,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<number> {
    const endpoints = await this.endpointModel.find({
      organizationId: this.toObjectId(organizationId),
      status: 'active',
      $or: [{ eventTypes: '*' }, { eventTypes: eventType }],
    });

    const eventId = `evt_${crypto.randomBytes(16).toString('hex')}`;

    for (const ep of endpoints) {
      await this.webhookQueue.add(
        'dispatch-webhook',
        {
          organizationId,
          workspaceId: ep.workspaceId.toString(),
          endpointId: ep._id.toString(),
          url: ep.url,
          secret: ep.secret,
          eventId,
          eventType,
          payload,
        },
        {
          jobId: `hook-${ep._id}-${eventId}`,
          attempts: 5,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );
    }

    this.logger.log(`Enqueued outbound event [${eventType}] to ${endpoints.length} active webhook endpoints`);
    return endpoints.length;
  }

  async listDeliveries(
    organizationId: string,
    workspaceId: string,
    endpointId?: string,
    pagination: PaginationQueryDto = {},
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
    };

    if (endpointId) {
      filter.endpointId = this.toObjectId(endpointId);
    }

    const [data, total] = await Promise.all([
      this.deliveryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.deliveryModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async testPing(endpointId: string, organizationId: string, workspaceId: string) {
    const ep = await this.getEndpointById(endpointId, organizationId, workspaceId);

    const pingPayload = {
      event: 'ping',
      message: 'Test webhook ping delivery from AI Automation SaaS',
      timestamp: new Date().toISOString(),
      endpointId: ep._id,
      organizationId,
    };

    return this.dispatchOutboundEvent(organizationId, workspaceId, 'ping', pingPayload);
  }
}
