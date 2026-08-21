import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../common/enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: (Permission | string)[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const RequirePermission = (permission: Permission | string) =>
  SetMetadata(PERMISSIONS_KEY, [permission]);
