import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Analytics & Dashboards')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('dashboard')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get unified executive metrics, AI token consumption, and quota dashboard' })
  async getDashboard(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.analyticsService.getDashboardAnalytics(orgId, wsId);
  }
}
