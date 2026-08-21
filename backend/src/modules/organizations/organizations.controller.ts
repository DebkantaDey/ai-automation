import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, InviteMemberDto } from './dto/create-org.dto';
import { UpdateOrganizationDto } from './dto/update-org.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentUser, Public, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';
import { OrganizationRole } from '../../core/common/enums/role.enum';

@ApiTags('Organizations & Teams')
@Controller()
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post('organizations')
  @ApiOperation({ summary: 'Create a new organization tenant' })
  @ApiResponse({ status: 201, description: 'Organization and default workspace created successfully' })
  async createOrg(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.orgService.create(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('organizations')
  @ApiOperation({ summary: 'List all organizations the authenticated user belongs to' })
  async getMyOrganizations(@CurrentUser('id') userId: string) {
    return this.orgService.getUserOrganizations(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('organizations/current')
  @RequireTenant()
  @RequirePermissions(Permission.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get details of the currently active organization tenant' })
  async getCurrentOrg(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.getCurrentOrg(orgId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('organizations/by-slug/:slug')
  @ApiOperation({ summary: 'Find organization metadata by slug' })
  async getBySlug(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.findBySlug(slug, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('organizations/:id')
  @RequirePermissions(Permission.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Get organization details by ID with membership check' })
  async getById(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.findById(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch('organizations/:id')
  @RequirePermissions(Permission.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Update organization settings' })
  async updateOrg(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.orgService.update(id, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete('organizations/:id')
  @RequirePermissions(Permission.ORGANIZATION_DELETE)
  @ApiOperation({ summary: 'Delete organization (Owner only)' })
  async deleteOrg(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.delete(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('organizations/:id/switch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch active organization tenant context' })
  async switchOrg(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.switchOrganization(userId, id);
  }

  // --- TEAM MEMBER MANAGEMENT ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('organizations/:id/members')
  @RequirePermissions(Permission.MEMBERS_READ)
  @ApiOperation({ summary: 'List all members in the organization' })
  async listMembers(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.listMembers(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Patch('organizations/:id/members/:memberId')
  @RequirePermissions(Permission.MEMBERS_UPDATE)
  @ApiOperation({ summary: 'Update member role in the organization' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
    @Body('role') role: OrganizationRole,
  ) {
    return this.orgService.updateMemberRole(id, userId, memberId, role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete('organizations/:id/members/:memberId')
  @RequirePermissions(Permission.MEMBERS_REMOVE)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.removeMember(id, userId, memberId);
  }

  // --- INVITATION SYSTEM ---

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Post('organizations/:id/invitations')
  @RequirePermissions(Permission.MEMBERS_INVITE)
  @ApiOperation({ summary: 'Send email invitation to join organization' })
  async inviteMember(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.orgService.createInvitation(id, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('organizations/:id/invitations')
  @RequirePermissions(Permission.MEMBERS_READ)
  @ApiOperation({ summary: 'List all pending invitations for the organization' })
  async listInvitations(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.listInvitations(id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Delete('organizations/:id/invitations/:inviteId')
  @RequirePermissions(Permission.MEMBERS_REMOVE)
  @ApiOperation({ summary: 'Revoke a pending invitation' })
  async revokeInvitation(
    @Param('id') id: string,
    @Param('inviteId') inviteId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.orgService.revokeInvitation(id, userId, inviteId);
  }

  @Public()
  @Get('invitations/validate')
  @ApiOperation({ summary: 'Validate an invitation token and view organization metadata' })
  async validateInvite(@Query('token') token: string) {
    return this.orgService.validateInvitationToken(token);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('invitations/accept')
  @ApiOperation({ summary: 'Accept an invitation and join organization team' })
  async acceptInvite(
    @CurrentUser('id') userId: string,
    @Body('token') token: string,
  ) {
    return this.orgService.acceptInvitation(userId, token);
  }
}
