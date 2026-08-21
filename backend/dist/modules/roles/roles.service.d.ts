import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { OrganizationMemberDocument } from '../organizations/schemas/organization-member.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class RolesService {
    private readonly roleModel;
    private readonly memberModel;
    private readonly logger;
    constructor(roleModel: Model<RoleDocument>, memberModel: Model<OrganizationMemberDocument>);
    private toObjectId;
    private slugify;
    getSystemRoles(): {
        id: string;
        name: string;
        slug: string;
        description: string;
        permissions: string[];
        isSystemRole: boolean;
        isCustom: boolean;
    }[];
    getAllPermissions(): {
        permissions: import("../../core/common/enums/permission.enum").Permission[];
        definitions: import("../../core/common/enums/permission.enum").PermissionDefinition[];
    };
    getRolesForOrganization(orgId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string;
        permissions: string[];
        isSystemRole: boolean;
        isCustom: boolean;
    }[]>;
    createCustomRole(orgId: string, userId: string, dto: CreateRoleDto): Promise<import("mongoose").Document<unknown, {}, RoleDocument, {}, {}> & Role & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateCustomRole(orgId: string, roleId: string, userId: string, dto: UpdateRoleDto): Promise<import("mongoose").Document<unknown, {}, RoleDocument, {}, {}> & Role & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteCustomRole(orgId: string, roleId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    resolvePermissions(orgId: string | undefined, roleNameOrId: string | Types.ObjectId): Promise<string[]>;
    checkPermission(userPermissions: string[], requiredPermission: string): boolean;
}
