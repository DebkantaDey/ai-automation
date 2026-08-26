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
import { LeadsService } from '../services/leads.service';
import { CreateLeadDto, UpdateLeadDto, ConvertLeadDto } from '../dto/lead.dto';
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

@ApiTags('CRM - Leads & Scoring')
@Controller('crm/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Create a new CRM lead and auto-score' })
  async createLead(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.createLead(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'List leads with filters, search, and pagination' })
  async listLeads(
    @CurrentOrganizationId() orgId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('source') source?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.leadsService.listLeads(orgId, {
      search,
      status,
      source,
      priority,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      sortBy,
      sortOrder,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get lead details' })
  async getLeadById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.getLeadById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id')
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Update lead attributes or stage' })
  async updateLead(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leadsService.updateLead(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/score')
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Trigger AI lead scoring recalculation' })
  async scoreLead(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
    @Body('promptContext') promptContext?: string,
  ) {
    return this.leadsService.scoreLeadById(orgId, id, promptContext);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/convert')
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Convert qualified lead to Customer and Deal' })
  async convertLead(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ConvertLeadDto,
  ) {
    return this.leadsService.convertLead(orgId, userId, id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.CRM_DELETE)
  @ApiOperation({ summary: 'Soft delete a lead' })
  async deleteLead(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.leadsService.deleteLead(orgId, id, userId);
  }
}
