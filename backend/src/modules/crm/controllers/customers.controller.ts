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
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto, UpdateCustomerDto, AddCustomerActivityDto } from '../dto/customer.dto';
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

@ApiTags('CRM - Customers & 360 Profiles')
@Controller('crm/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Create a new Customer profile' })
  async createCustomer(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.createCustomer(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'List customers with filters and pagination' })
  async listCustomers(
    @CurrentOrganizationId() orgId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('tier') tier?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.customersService.listCustomers(orgId, {
      search,
      status,
      tier,
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
  @ApiOperation({ summary: 'Get Customer basic record' })
  async getCustomerById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.getCustomerById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id/360')
  @RequirePermissions(Permission.CRM_READ)
  @ApiOperation({ summary: 'Get Customer 360-degree aggregated profile & timeline' })
  async getCustomer360(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.getCustomer360(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/activities')
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Record interaction activity or note on customer timeline' })
  async addActivity(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: AddCustomerActivityDto,
  ) {
    return this.customersService.addActivity(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id')
  @RequirePermissions(Permission.CRM_WRITE)
  @ApiOperation({ summary: 'Update Customer profile' })
  async updateCustomer(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.CRM_DELETE)
  @ApiOperation({ summary: 'Soft delete customer' })
  async deleteCustomer(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.customersService.deleteCustomer(orgId, id, userId);
  }
}
