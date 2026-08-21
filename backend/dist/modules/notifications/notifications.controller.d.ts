import { NotificationsService } from './notifications.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    list(orgId: string, wsId: string, userId: string, pagination: PaginationQueryDto): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/notification.schema").NotificationDocument, {}, {}> & import("./schemas/notification.schema").Notification & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    markAsRead(id: string, orgId: string, wsId: string): Promise<import("./schemas/notification.schema").NotificationDocument>;
    markAllAsRead(orgId: string, userId: string): Promise<{
        success: boolean;
    }>;
    getPreferences(userId: string, orgId: string, wsId: string): Promise<import("./schemas/notification-preference.schema").NotificationPreferenceDocument>;
    updatePreferences(userId: string, orgId: string, wsId: string, updates: any): Promise<import("./schemas/notification-preference.schema").NotificationPreferenceDocument>;
}
