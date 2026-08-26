import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Automation & Vertical Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get()
  @ApiOperation({ summary: 'List pre-built automation workflow templates' })
  listTemplates() {
    return this.templatesService.listTemplates();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('verticals')
  @ApiOperation({ summary: 'List industry-specific business vertical blueprints (Real Estate, Healthcare, Coaching, Salons, Contractors)' })
  listVerticals() {
    return this.templatesService.listVerticals();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('verticals/:slug')
  @ApiOperation({ summary: 'Get complete vertical blueprint specifications' })
  getVerticalBySlug(@Param('slug') slug: string) {
    return this.templatesService.getVerticalBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('verticals/:slug/instantiate')
  @RequirePermissions(Permission.WORKSPACE_UPDATE)
  @ApiOperation({ summary: '1-Click instantiate vertical blueprint (Configures CRM, AI Agent, Workflows, Services, and sample Invoices)' })
  async instantiateVertical(
    @Param('slug') slug: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.instantiateVertical(slug, orgId, wsId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get(':slug')
  @ApiOperation({ summary: 'Get details for a specific workflow template' })
  getTemplateBySlug(@Param('slug') slug: string) {
    return this.templatesService.getTemplateBySlug(slug);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':slug/clone')
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Clone template into active workspace as a customizable workflow' })
  async cloneTemplate(
    @Param('slug') slug: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('name') customName?: string,
  ) {
    return this.templatesService.cloneTemplate(slug, orgId, wsId, userId, customName);
  }
}
