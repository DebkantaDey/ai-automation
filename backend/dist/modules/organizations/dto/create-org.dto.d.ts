import { OrganizationRole } from '../../../core/common/enums/role.enum';
export declare class CreateOrganizationDto {
    name: string;
    slug?: string;
    logo?: string;
    logoUrl?: string;
    description?: string;
    industry?: string;
    website?: string;
    timezone?: string;
    country?: string;
    defaultCurrency?: string;
}
export declare class InviteMemberDto {
    email: string;
    role?: OrganizationRole;
}
