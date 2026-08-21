import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../../tenancy/tenant.decorators';
import { SystemRole } from '../../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    // Super Admins bypass all role checks
    if (user.systemRole === SystemRole.SUPER_ADMIN) {
      return true;
    }

    const userRole = user.role || user.systemRole;
    const hasRole = requiredRoles.some((role) => role === userRole);

    if (!hasRole) {
      throw new ForbiddenException(`Insufficient role. Required: [${requiredRoles.join(', ')}], Found: [${userRole || 'none'}]`);
    }

    return true;
  }
}
