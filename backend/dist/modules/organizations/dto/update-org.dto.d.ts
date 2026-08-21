export declare class UpdateOrganizationDto {
    name?: string;
    logo?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    website?: string;
    timezone?: string;
    country?: string;
    defaultCurrency?: string;
    status?: 'active' | 'suspended' | 'trial' | 'cancelled';
}
