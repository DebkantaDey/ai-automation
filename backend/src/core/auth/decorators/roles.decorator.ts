import { SetMetadata } from '@nestjs/common';
import { OrganizationRole, WorkspaceRole } from '../../common/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (OrganizationRole | WorkspaceRole | string)[]) =>
  SetMetadata(ROLES_KEY, roles);
