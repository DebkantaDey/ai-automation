import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@ApiTags('Platform SuperAdmin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('overview')
  @ApiOperation({ summary: 'Platform-wide aggregated business and execution metrics' })
  async getOverview() {
    return this.adminService.getPlatformOverview();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('health')
  @ApiOperation({ summary: 'Deep infrastructure health diagnostics (DB, Redis, Queues, AI, Payments)' })
  async getHealth() {
    return this.adminService.getSystemHealth();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('organizations')
  @ApiOperation({ summary: 'List all tenant organizations across platform' })
  async listOrganizations(@Query() pagination: PaginationQueryDto) {
    return this.adminService.listOrganizations(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('audit-logs')
  @ApiOperation({ summary: 'Global cross-tenant security audit logs' })
  async listGlobalAuditLogs(@Query() pagination: PaginationQueryDto) {
    return this.adminService.listGlobalAuditLogs(pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @Get('dlq')
  @ApiOperation({ summary: 'Global Dead Letter Queue failed execution inspector' })
  async listGlobalDlq(@Query() pagination: PaginationQueryDto) {
    return this.adminService.listGlobalDeadLetterQueue(pagination);
  }
}
