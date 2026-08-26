import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DealsService } from '../services/deals.service';
import { CreateDealDto, UpdateDealDto } from '../dto/deal.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../core/auth/guards/permissions.guard';
import {
  CurrentOrganizationId,
  CurrentWorkspaceId,
  CurrentUser,
  RequireTenant,
} from '../../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../../core/common/enums/permission.enum';

@ApiTags('CRM - Deals & Pipeline')
@Controller('crm/deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.DEALS_MANAGE)
  @ApiOperation({ summary: 'Create a new pipeline deal' })
  async createDeal(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateDealDto,
  ) {
    return this.dealsService.createDeal(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'List deals with pipeline stage filters' })
  async listDeals(
    @CurrentOrganizationId() orgId: string,
    @Query('search') search?: string,
    @Query('stage') stage?: string,
    @Query('customerId') customerId?: string,
    @Query('leadId') leadId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.dealsService.listDeals(orgId, {
      search,
      stage,
      customerId,
      leadId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy,
      sortOrder,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('summary')
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get CRM Pipeline revenue and conversion analytics summary' })
  async getPipelineSummary(
    @CurrentOrganizationId() orgId: string,
  ) {
    return this.dealsService.getPipelineSummary(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get deal details' })
  async getDealById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.dealsService.getDealById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id')
  @RequirePermissions(Permission.DEALS_MANAGE)
  @ApiOperation({ summary: 'Update deal stage or probability' })
  async updateDeal(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealsService.updateDeal(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.DEALS_MANAGE)
  @ApiOperation({ summary: 'Soft delete deal' })
  async deleteDeal(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.dealsService.deleteDeal(orgId, id, userId);
  }
}
