import { OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { NotificationPreference, NotificationPreferenceDocument } from './schemas/notification-preference.schema';
import { EventBusService } from '../../core/events/event-bus.service';
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
export declare class NotificationsService implements OnModuleInit {
    private readonly notificationModel;
    private readonly preferenceModel;
    private readonly eventBus?;
    private readonly logger;
    constructor(notificationModel: Model<NotificationDocument>, preferenceModel: Model<NotificationPreferenceDocument>, eventBus?: EventBusService);
    private toObjectId;
    onModuleInit(): void;
    createNotification(organizationId: string, workspaceId: string, userId: string | undefined, dto: CreateNotificationDto): Promise<NotificationDocument>;
    listNotifications(organizationId: string, workspaceId: string, userId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, NotificationDocument, {}, {}> & Notification & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markAsRead(id: string, organizationId: string, workspaceId: string): Promise<NotificationDocument>;
    markAllAsRead(organizationId: string, userId: string): Promise<void>;
    getPreferences(userId: string, organizationId: string, workspaceId: string): Promise<NotificationPreferenceDocument>;
    updatePreferences(userId: string, organizationId: string, workspaceId: string, updates: Partial<NotificationPreference>): Promise<NotificationPreferenceDocument>;
}
