import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { OrganizationMember, OrganizationMemberDocument } from '../organizations/schemas/organization-member.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SystemRolePermissions, ALL_PERMISSIONS, PERMISSION_DEFINITIONS } from '../../core/common/enums/permission.enum';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(OrganizationMember.name) private readonly memberModel: Model<OrganizationMemberDocument>,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getSystemRoles() {
    return [
      {
        id: 'system-owner',
        name: 'Owner',
        slug: 'owner',
        description: 'Full administrative access and ownership permissions across the organization',
        permissions: SystemRolePermissions['owner'],
        isSystemRole: true,
        isCustom: false,
      },
      {
        id: 'system-admin',
        name: 'Admin',
        slug: 'admin',
        description: 'Administrative access for team, workflows, integrations, and configurations',
        permissions: SystemRolePermissions['admin'],
        isSystemRole: true,
        isCustom: false,
      },
      {
        id: 'system-manager',
        name: 'Manager',
        slug: 'manager',
        description: 'Can build, configure, and delete workflows, AI agents, and integrations',
        permissions: SystemRolePermissions['manager'],
        isSystemRole: true,
        isCustom: false,
      },
      {
        id: 'system-operator',
        name: 'Operator',
        slug: 'operator',
        description: 'Can trigger, execute, and monitor automated workflows and AI tasks',
        permissions: SystemRolePermissions['operator'],
        isSystemRole: true,
        isCustom: false,
      },
      {
        id: 'system-viewer',
        name: 'Viewer',
        slug: 'viewer',
        description: 'Read-only access to organization workflows, analytics, and execution logs',
        permissions: SystemRolePermissions['viewer'],
        isSystemRole: true,
        isCustom: false,
      },
      {
        id: 'system-member',
        name: 'Member',
        slug: 'member',
        description: 'Standard member access with workflow execution and creation rights',
        permissions: SystemRolePermissions['member'],
        isSystemRole: true,
        isCustom: false,
      },
    ];
  }

  getAllPermissions() {
    return {
      permissions: ALL_PERMISSIONS,
      definitions: PERMISSION_DEFINITIONS,
    };
  }

  async getRolesForOrganization(orgId: string) {
    const customRoles = await this.roleModel.find({
      organizationId: this.toObjectId(orgId),
    });

    const systemRoles = this.getSystemRoles();

    const formattedCustomRoles = customRoles.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      slug: r.slug,
      description: r.description,
      permissions: r.permissions,
      isSystemRole: false,
      isCustom: true,
      organizationId: r.organizationId?.toString(),
      createdAt: r.createdAt,
    }));

    return [...systemRoles, ...formattedCustomRoles];
  }

  async createCustomRole(orgId: string, userId: string, dto: CreateRoleDto) {
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    // Prevent collision with system role slugs
    const systemSlugs = ['owner', 'admin', 'manager', 'operator', 'viewer', 'member', 'billing_manager'];
    if (systemSlugs.includes(slug)) {
      throw new ConflictException(`Role slug '${slug}' is reserved for system roles`);
    }

    const existing = await this.roleModel.findOne({
      organizationId: this.toObjectId(orgId),
      slug,
    });

    if (existing) {
      throw new ConflictException(`A role with slug '${slug}' already exists in this organization`);
    }

    const role = new this.roleModel({
      name: dto.name,
      slug,
      description: dto.description || '',
      organizationId: this.toObjectId(orgId),
      permissions: dto.permissions,
      isSystemRole: false,
      isCustom: true,
    });

    await role.save();
    return role;
  }

  async updateCustomRole(orgId: string, roleId: string, userId: string, dto: UpdateRoleDto) {
    const role = await this.roleModel.findOne({
      _id: this.toObjectId(roleId),
      organizationId: this.toObjectId(orgId),
    });

    if (!role) {
      throw new NotFoundException('Role not found in this organization');
    }

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be modified');
    }

    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.permissions !== undefined) role.permissions = dto.permissions;

    await role.save();
    return role;
  }

  async deleteCustomRole(orgId: string, roleId: string, userId: string) {
    const role = await this.roleModel.findOne({
      _id: this.toObjectId(roleId),
      organizationId: this.toObjectId(orgId),
    });

    if (!role) {
      throw new NotFoundException('Role not found in this organization');
    }

    if (role.isSystemRole) {
      throw new ForbiddenException('System roles cannot be deleted');
    }

    // Check if any member is currently assigned to this role
    const assignedCount = await this.memberModel.countDocuments({
      organizationId: this.toObjectId(orgId),
      roleId: role._id,
    });

    if (assignedCount > 0) {
      throw new ConflictException(
        `Cannot delete role: ${assignedCount} active member(s) are currently assigned to this role. Reassign them first.`,
      );
    }

    await this.roleModel.deleteOne({ _id: role._id });

    return {
      success: true,
      message: `Role '${role.name}' deleted successfully`,
    };
  }

  async resolvePermissions(orgId: string | undefined, roleNameOrId: string | Types.ObjectId): Promise<string[]> {
    const roleKey = String(roleNameOrId).toLowerCase();

    // Check standard system role permissions
    if (SystemRolePermissions[roleKey]) {
      return SystemRolePermissions[roleKey];
    }

    // Check custom role by ObjectId or slug
    if (orgId) {
      const query: any = { organizationId: this.toObjectId(orgId) };
      if (Types.ObjectId.isValid(roleKey)) {
        query._id = this.toObjectId(roleKey);
      } else {
        query.slug = roleKey;
      }

      const customRole = await this.roleModel.findOne(query);
      if (customRole && Array.isArray(customRole.permissions)) {
        return customRole.permissions;
      }
    }

    // Default fallback
    return SystemRolePermissions['viewer'];
  }

  checkPermission(userPermissions: string[], requiredPermission: string): boolean {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // Wildcard match for Owner
    if (userPermissions.includes('*')) {
      return true;
    }

    // Exact match
    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    // Resource wildcard match (e.g. 'workflow.*' matches 'workflow.create')
    const [resource] = requiredPermission.split('.');
    if (resource && userPermissions.includes(`${resource}.*`)) {
      return true;
    }

    return false;
  }
}
