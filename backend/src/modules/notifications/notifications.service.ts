import {
  Injectable,
  NotFoundException,
  Logger,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationPreference, NotificationPreferenceDocument } from './schemas/notification-preference.schema';
import { EventBusService, DomainEvent } from '../../core/events/event-bus.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  event: string;
  channel?: 'in_app' | 'email' | 'slack' | 'webhook';
  linkUrl?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationPreference.name) private readonly preferenceModel: Model<NotificationPreferenceDocument>,
    @Optional() private readonly eventBus?: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  onModuleInit() {
    if (this.eventBus) {
      this.eventBus.on('*', async (event: DomainEvent) => {
        if (!event.organizationId) return;

        let title = `System Event: ${event.type}`;
        let message = `Event ${event.type} triggered`;
        let type: 'info' | 'success' | 'warning' | 'error' = 'info';

        if (event.type === 'workflow.completed') {
          title = 'Workflow Execution Completed';
          message = `Workflow [${event.data?.workflowId}] finished in ${event.data?.durationMs || 0}ms`;
          type = 'success';
        } else if (event.type === 'workflow.failed') {
          title = 'Workflow Execution Failed';
          message = `Workflow execution failed: ${event.data?.error || 'Unknown error'}`;
          type = 'error';
        } else if (event.type === 'workflow.waiting_approval') {
          title = 'Approval Required for Workflow';
          message = `Workflow execution paused waiting for ${event.data?.requiredRole || 'Manager'} approval`;
          type = 'warning';
        } else if (event.type === 'payment.succeeded') {
          title = 'Subscription Payment Succeeded';
          message = 'Your subscription payment was processed successfully.';
          type = 'success';
        } else if (event.type === 'payment.failed') {
          title = 'Subscription Payment Failed';
          message = 'Payment attempt failed. Please update your payment method.';
          type = 'error';
        }

        try {
          await this.createNotification(
            event.organizationId,
            event.workspaceId || '',
            undefined,
            {
              title,
              message,
              type,
              event: event.type,
              metadata: event.data,
            },
          );
        } catch (err: any) {
          this.logger.warn(`Failed to generate notification for event [${event.type}]: ${err.message}`);
        }
      });
    }
  }

  async createNotification(
    organizationId: string,
    workspaceId: string,
    userId: string | undefined,
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const notif = new this.notificationModel({
      organizationId: this.toObjectId(organizationId),
      workspaceId: this.toObjectId(workspaceId),
      userId: userId ? this.toObjectId(userId) : undefined,
      title: dto.title,
      message: dto.message,
      type: dto.type || 'info',
      event: dto.event,
      channel: dto.channel || 'in_app',
      linkUrl: dto.linkUrl || '',
      metadata: dto.metadata || {},
      isRead: false,
    });

    return notif.save();
  }

  async listNotifications(
    organizationId: string,
    workspaceId: string,
    userId: string,
    pagination: PaginationQueryDto,
  ) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      $or: [{ userId: this.toObjectId(userId) }, { userId: null }, { userId: { $exists: false } }],
    };

    const [data, total, unreadCount] = await Promise.all([
      this.notificationModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.notificationModel.countDocuments(filter).exec(),
      this.notificationModel.countDocuments({ ...filter, isRead: false }).exec(),
    ]);

    return {
      data,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async markAsRead(
    id: string,
    organizationId: string,
    workspaceId: string,
  ): Promise<NotificationDocument> {
    const notif = await this.notificationModel.findOneAndUpdate(
      { _id: this.toObjectId(id), organizationId: this.toObjectId(organizationId) },
      { $set: { isRead: true } },
      { new: true },
    );

    if (!notif) {
      throw new NotFoundException('Notification not found');
    }
    return notif;
  }

  async markAllAsRead(organizationId: string, userId: string): Promise<void> {
    await this.notificationModel.updateMany(
      {
        organizationId: this.toObjectId(organizationId),
        $or: [{ userId: this.toObjectId(userId) }, { userId: null }],
        isRead: false,
      },
      { $set: { isRead: true } },
    );
  }

  async getPreferences(userId: string, organizationId: string, workspaceId: string): Promise<NotificationPreferenceDocument> {
    let pref = await this.preferenceModel.findOne({
      userId: this.toObjectId(userId),
      organizationId: this.toObjectId(organizationId),
    });

    if (!pref) {
      pref = new this.preferenceModel({
        userId: this.toObjectId(userId),
        organizationId: this.toObjectId(organizationId),
        workspaceId: this.toObjectId(workspaceId),
      });
      await pref.save();
    }

    return pref;
  }

  async updatePreferences(
    userId: string,
    organizationId: string,
    workspaceId: string,
    updates: Partial<NotificationPreference>,
  ): Promise<NotificationPreferenceDocument> {
    const pref = await this.preferenceModel.findOneAndUpdate(
      { userId: this.toObjectId(userId), organizationId: this.toObjectId(organizationId) },
      { $set: updates },
      { new: true, upsert: true },
    );
    return pref;
  }
}
