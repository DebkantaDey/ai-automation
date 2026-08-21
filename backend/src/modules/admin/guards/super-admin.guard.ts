import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (!user.isSuperAdmin && user.role !== 'system_admin')) {
      throw new ForbiddenException('Platform Administrator access required');
    }

    return true;
  }
}
