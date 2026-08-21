import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../../tenancy/tenant.decorators';
import { Permission } from '../../common/enums/permission.enum';
import { SystemRole } from '../../common/enums/role.enum';
import { RolesService } from '../../../modules/roles/roles.service';
import { OrganizationMember, OrganizationMemberDocument } from '../../../modules/organizations/schemas/organization-member.schema';
import { TenantContextService } from '../../tenancy/tenant-context.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesService: RolesService,
    @InjectModel(OrganizationMember.name)
    private readonly memberModel: Model<OrganizationMemberDocument>,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[] | string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    if (!user) {
      throw new ForbiddenException('User context not found');
    }

    if (user.systemRole === SystemRole.SUPER_ADMIN) {
      return true;
    }

    const orgId =
      request?.headers['x-organization-id'] ||
      request?.params?.orgId ||
      TenantContextService.getOrganizationId() ||
      user.organizationId;

    const userId = user.id || user._id?.toString();

    let userRole = user.role || 'viewer';
    let roleId: any = undefined;

    if (orgId && userId) {
      const member = await this.memberModel.findOne({
        organizationId: this.toObjectId(orgId),
        userId: this.toObjectId(userId),
        status: 'active',
      });

      if (!member) {
        throw new ForbiddenException('Access denied: You are not an active member of this organization');
      }

      userRole = member.role;
      roleId = member.roleId;
    }

    // Resolve effective permissions
    const effectivePermissions = await this.rolesService.resolvePermissions(
      orgId ? String(orgId) : undefined,
      roleId || userRole,
    );

    // Verify all required permissions
    const missingPermissions = requiredPermissions.filter(
      (required) => !this.rolesService.checkPermission(effectivePermissions, String(required)),
    );

    if (missingPermissions.length > 0) {
      throw new ForbiddenException(
        `Insufficient permissions. Missing: [${missingPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
