import { Permission } from '../../common/enums/permission.enum';
export declare const PERMISSIONS_KEY = "permissions";
export declare const RequirePermissions: (...permissions: (Permission | string)[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequirePermission: (permission: Permission | string) => import("@nestjs/common").CustomDecorator<string>;
