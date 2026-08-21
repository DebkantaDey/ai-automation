import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { REQUIRE_TENANT_KEY, REQUIRE_WORKSPACE_KEY, IS_PUBLIC_KEY } from './tenant.decorators';
import { TenantContextService } from './tenant-context.service';
import { OrganizationMember, OrganizationMemberDocument } from '../../modules/organizations/schemas/organization-member.schema';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
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

    const requireTenant = this.reflector.getAllAndOverride<boolean>(REQUIRE_TENANT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requireWorkspace = this.reflector.getAllAndOverride<boolean>(REQUIRE_WORKSPACE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const userId = request?.user?.id || request?.user?._id?.toString();
    const orgId =
      request?.headers['x-organization-id'] ||
      TenantContextService.getOrganizationId();
    const wsId =
      request?.headers['x-workspace-id'] ||
      TenantContextService.getWorkspaceId();

    if (requireTenant && !orgId) {
      throw new BadRequestException('Organization context (x-organization-id) is required for this operation');
    }

    if (requireWorkspace && !wsId) {
      throw new BadRequestException('Workspace context (x-workspace-id) is required for this operation');
    }

    // Strict Server-Side Cross-Tenant Membership Verification
    if (orgId && userId) {
      const member = await this.memberModel.findOne({
        organizationId: this.toObjectId(orgId),
        userId: this.toObjectId(userId),
        status: 'active',
      });

      if (!member) {
        throw new ForbiddenException('Access denied: You are not an active member of this organization');
      }

      // Update verified role on request object for downstream RolesGuard
      if (request.user) {
        request.user.role = member.role;
        request.user.organizationId = String(orgId);
      }
    }

    return true;
  }
}
