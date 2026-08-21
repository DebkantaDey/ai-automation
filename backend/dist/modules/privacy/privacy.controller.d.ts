import { PrivacyService } from './privacy.service';
export declare class PrivacyController {
    private readonly privacyService;
    constructor(privacyService: PrivacyService);
    exportUserData(userId: string): Promise<Record<string, any>>;
    exportOrgData(orgId: string): Promise<Record<string, any>>;
    getConsent(userId: string): Promise<import("./schemas/privacy-consent.schema").PrivacyConsent | {
        analyticsConsent: true;
        marketingConsent: false;
        dataProcessingConsent: true;
    }>;
    updateConsent(userId: string, dto: {
        analyticsConsent?: boolean;
        marketingConsent?: boolean;
        dataProcessingConsent?: boolean;
    }, ipAddress: string): Promise<import("./schemas/privacy-consent.schema").PrivacyConsent>;
    deleteAccount(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteOrganization(orgId: string): Promise<{
        success: boolean;
        deletedCounts: Record<string, number>;
    }>;
}
