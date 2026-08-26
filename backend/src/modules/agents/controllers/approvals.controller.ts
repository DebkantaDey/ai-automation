import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApprovalsService } from '../services/approvals.service';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../core/auth/guards/permissions.guard';
import {
  CurrentOrganizationId,
  CurrentUser,
  RequireTenant,
} from '../../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../../core/common/enums/permission.enum';

@ApiTags('Human Approval Gate')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.AI_READ)
  @ApiOperation({ summary: 'List pending and reviewed human approval requests' })
  async listApprovals(
    @CurrentOrganizationId() orgId: string,
    @Query('status') status?: string,
    @Query('actionType') actionType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.approvalsService.listApprovals(orgId, {
      status,
      actionType,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.AI_READ)
  @ApiOperation({ summary: 'Get approval request details' })
  async getApprovalById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.approvalsService.getApprovalById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/review')
  @RequirePermissions(Permission.AI_MANAGE)
  @ApiOperation({ summary: 'Authorize or reject sensitive AI action' })
  async reviewApproval(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('decision') decision: 'approved' | 'rejected',
    @Body('notes') notes?: string,
  ) {
    return this.approvalsService.reviewApproval(orgId, id, userId, decision, notes);
  }
}
