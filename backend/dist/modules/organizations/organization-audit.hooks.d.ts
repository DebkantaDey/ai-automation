export type OrganizationAuditEventType = 'organization.created' | 'organization.updated' | 'organization.deleted' | 'organization.member.added' | 'organization.member.removed' | 'organization.settings.updated';
export interface OrganizationAuditEventPayload {
    organizationId: string;
    actorUserId: string;
    eventType: OrganizationAuditEventType;
    metadata?: Record<string, any>;
    timestamp?: Date;
}
export declare class OrganizationAuditHooks {
    private readonly logger;
    emit(payload: OrganizationAuditEventPayload): Promise<void>;
}
