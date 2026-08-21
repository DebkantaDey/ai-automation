import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Roles & Permissions')
@Controller()
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions')
  @ApiOperation({ summary: 'List all system permission definitions' })
  getPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('organizations/:orgId/roles')
  @ApiOperation({ summary: 'List all system and custom roles for an organization' })
  async getRoles(@Param('orgId') orgId: string) {
    return this.rolesService.getRolesForOrganization(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('organizations/:orgId/roles')
  @RequirePermissions(Permission.ROLES_CREATE)
  @ApiOperation({ summary: 'Create a custom role for the organization' })
  async createRole(
    @Param('orgId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRoleDto,
  ) {
    return this.rolesService.createCustomRole(orgId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('organizations/:orgId/roles/:roleId')
  @RequirePermissions(Permission.ROLES_UPDATE)
  @ApiOperation({ summary: 'Update a custom role' })
  async updateRole(
    @Param('orgId') orgId: string,
    @Param('roleId') roleId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.rolesService.updateCustomRole(orgId, roleId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('organizations/:orgId/roles/:roleId')
  @RequirePermissions(Permission.ROLES_DELETE)
  @ApiOperation({ summary: 'Delete a custom role (if not assigned to any member)' })
  async deleteRole(
    @Param('orgId') orgId: string,
    @Param('roleId') roleId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.rolesService.deleteCustomRole(orgId, roleId, userId);
  }
}
