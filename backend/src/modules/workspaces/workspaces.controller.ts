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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import {
  CurrentOrganizationId,
  CurrentWorkspaceId,
  CurrentUser,
  RequireTenant,
} from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireTenant()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @RequirePermissions(Permission.WORKSPACE_CREATE)
  @ApiOperation({ summary: 'Create a new workspace within active organization' })
  @ApiResponse({ status: 201, description: 'Workspace created successfully' })
  async create(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(orgId, userId, dto);
  }

  @Get()
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: 'List all workspaces for active organization' })
  async list(@CurrentOrganizationId() orgId: string) {
    return this.workspacesService.listByOrganization(orgId);
  }

  @Get('current')
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: 'Get current active workspace details' })
  async getCurrent(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() workspaceId: string,
  ) {
    return this.workspacesService.getCurrent(orgId, workspaceId);
  }

  @Get('by-slug/:slug')
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: 'Get workspace details by slug' })
  async getBySlug(
    @CurrentOrganizationId() orgId: string,
    @Param('slug') slug: string,
  ) {
    return this.workspacesService.findBySlug(orgId, slug);
  }

  @Get(':id')
  @RequirePermissions(Permission.WORKSPACE_READ)
  @ApiOperation({ summary: 'Get workspace details by ID' })
  async getById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.workspacesService.findById(id, orgId);
  }

  @Patch(':id')
  @RequirePermissions(Permission.WORKSPACE_UPDATE)
  @ApiOperation({ summary: 'Update workspace metadata and settings' })
  async update(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(id, orgId, dto);
  }

  @Post(':id/archive')
  @RequirePermissions(Permission.WORKSPACE_ARCHIVE)
  @ApiOperation({ summary: 'Archive a workspace (prevents new workflow executions)' })
  async archive(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.workspacesService.archive(id, orgId);
  }

  @Delete(':id')
  @RequirePermissions(Permission.WORKSPACE_DELETE)
  @ApiOperation({ summary: 'Delete a non-default workspace' })
  async delete(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.workspacesService.delete(id, orgId);
  }
}
