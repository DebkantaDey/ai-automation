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
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkPaidDto } from '../dto/invoice.dto';
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

@ApiTags('Invoices & Billing Ledger')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.INVOICES_WRITE)
  @ApiOperation({ summary: 'Create a new customer invoice' })
  async createInvoice(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.createInvoice(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.INVOICES_READ)
  @ApiOperation({ summary: 'List customer invoices' })
  async listInvoices(
    @CurrentOrganizationId() orgId: string,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.invoicesService.listInvoices(orgId, {
      status,
      customerId,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('summary')
  @RequirePermissions(Permission.INVOICES_READ)
  @ApiOperation({ summary: 'Get invoicing receivables and revenue summary' })
  async getInvoiceSummary(
    @CurrentOrganizationId() orgId: string,
  ) {
    return this.invoicesService.getInvoiceSummary(orgId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.INVOICES_READ)
  @ApiOperation({ summary: 'Get invoice details' })
  async getInvoiceById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.getInvoiceById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/send')
  @RequirePermissions(Permission.INVOICES_WRITE)
  @ApiOperation({ summary: 'Mark invoice as sent' })
  async sendInvoice(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.sendInvoice(orgId, id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/mark-paid')
  @RequirePermissions(Permission.INVOICES_WRITE)
  @ApiOperation({ summary: 'Settle invoice and record payment in ledger' })
  async markPaid(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: MarkPaidDto,
  ) {
    return this.invoicesService.markPaid(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id')
  @RequirePermissions(Permission.INVOICES_WRITE)
  @ApiOperation({ summary: 'Update invoice properties' })
  async updateInvoice(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.updateInvoice(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.INVOICES_WRITE)
  @ApiOperation({ summary: 'Soft delete an invoice' })
  async deleteInvoice(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.deleteInvoice(orgId, id, userId);
  }
}
