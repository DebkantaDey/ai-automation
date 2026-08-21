import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from '../../core/common/enums/permission.enum';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    getPermissions(): {
        permissions: Permission[];
        definitions: import("../../core/common/enums/permission.enum").PermissionDefinition[];
    };
    getRoles(orgId: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string;
        permissions: string[];
        isSystemRole: boolean;
        isCustom: boolean;
    }[]>;
    createRole(orgId: string, userId: string, dto: CreateRoleDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/role.schema").RoleDocument, {}, {}> & import("./schemas/role.schema").Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateRole(orgId: string, roleId: string, userId: string, dto: UpdateRoleDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/role.schema").RoleDocument, {}, {}> & import("./schemas/role.schema").Role & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteRole(orgId: string, roleId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
