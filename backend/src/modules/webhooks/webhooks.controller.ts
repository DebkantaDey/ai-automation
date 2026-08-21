import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebhooksService, CreateWebhookEndpointDto } from './webhooks.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('endpoints')
  @RequirePermissions(Permission.INTEGRATION_CONNECT)
  @ApiOperation({ summary: 'Register a new outbound webhook endpoint' })
  async createEndpoint(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWebhookEndpointDto,
  ) {
    return this.webhooksService.createEndpoint(orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('endpoints')
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'List all outbound webhook endpoints for workspace' })
  async listEndpoints(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.webhooksService.listEndpoints(orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('endpoints/:id')
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'Get details for a specific webhook endpoint' })
  async getEndpointById(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.webhooksService.getEndpointById(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Put('endpoints/:id')
  @RequirePermissions(Permission.INTEGRATION_UPDATE)
  @ApiOperation({ summary: 'Update webhook endpoint URL, event types, or status' })
  async updateEndpoint(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Body() updates: Partial<CreateWebhookEndpointDto> & { status?: string },
  ) {
    return this.webhooksService.updateEndpoint(id, orgId, wsId, updates);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('endpoints/:id/rotate-secret')
  @RequirePermissions(Permission.INTEGRATION_UPDATE)
  @ApiOperation({ summary: 'Rotate HMAC signing secret for webhook endpoint' })
  async rotateSecret(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.webhooksService.rotateSecret(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete('endpoints/:id')
  @RequirePermissions(Permission.INTEGRATION_DELETE)
  @ApiOperation({ summary: 'Delete outbound webhook endpoint' })
  async deleteEndpoint(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    await this.webhooksService.deleteEndpoint(id, orgId, wsId);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('endpoints/:id/test')
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'Send a test ping delivery to webhook endpoint' })
  async testPing(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.webhooksService.testPing(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('deliveries')
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'List delivery attempt logs and responses' })
  async listDeliveries(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query('endpointId') endpointId?: string,
    @Query() pagination?: PaginationQueryDto,
  ) {
    return this.webhooksService.listDeliveries(orgId, wsId, endpointId, pagination);
  }
}
