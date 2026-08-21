import { Injectable, Logger } from '@nestjs/common';

export type OrganizationAuditEventType =
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  | 'organization.member.added'
  | 'organization.member.removed'
  | 'organization.settings.updated';

export interface OrganizationAuditEventPayload {
  organizationId: string;
  actorUserId: string;
  eventType: OrganizationAuditEventType;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

@Injectable()
export class OrganizationAuditHooks {
  private readonly logger = new Logger(OrganizationAuditHooks.name);

  async emit(payload: OrganizationAuditEventPayload): Promise<void> {
    const event = {
      ...payload,
      timestamp: payload.timestamp || new Date(),
    };

    this.logger.log(
      `[AUDIT HOOK] Event: ${event.eventType} | Org: ${event.organizationId} | Actor: ${event.actorUserId} | Data: ${JSON.stringify(event.metadata || {})}`,
    );

    // Integration point for background audit-log worker queue and database persistence
  }
}
