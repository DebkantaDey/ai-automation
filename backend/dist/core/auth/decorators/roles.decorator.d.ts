import { OrganizationRole, WorkspaceRole } from '../../common/enums/role.enum';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: (OrganizationRole | WorkspaceRole | string)[]) => import("@nestjs/common").CustomDecorator<string>;
