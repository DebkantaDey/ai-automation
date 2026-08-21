import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IntegrationsService, ConnectApiKeyDto } from './integrations.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('catalog')
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'List supported integration connector catalog' })
  async getCatalog() {
    return this.integrationsService.getAvailableCatalog();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'List all active integration connections in current workspace' })
  async listConnections(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.integrationsService.listConnections(orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('connect/api-key')
  @RequirePermissions(Permission.INTEGRATION_CONNECT)
  @ApiOperation({ summary: 'Connect integration using API Key or Webhook URL' })
  async connectWithApiKey(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ConnectApiKeyDto,
  ) {
    return this.integrationsService.connectWithApiKey(orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('oauth/:provider/authorize')
  @RequirePermissions(Permission.INTEGRATION_CONNECT)
  @ApiOperation({ summary: 'Get OAuth2 authorization URL for external provider' })
  async getOAuthAuthorizeUrl(
    @Param('provider') provider: string,
    @Query('state') state: string,
  ) {
    const url = this.integrationsService.getOAuthAuthorizeUrl(provider, state || 'default');
    return { url };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('oauth/:provider/callback')
  @RequirePermissions(Permission.INTEGRATION_CONNECT)
  @ApiOperation({ summary: 'Exchange OAuth2 authorization code and create connection' })
  async handleOAuthCallback(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Param('provider') provider: string,
    @Body('code') code: string,
  ) {
    return this.integrationsService.handleOAuthCallback(orgId, wsId, userId, provider, code);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/test')
  @RequirePermissions(Permission.INTEGRATION_READ)
  @ApiOperation({ summary: 'Test connectivity and credentials for an integration' })
  async testConnection(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    const valid = await this.integrationsService.testConnection(id, orgId, wsId);
    return { valid, status: valid ? 'connected' : 'error' };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.INTEGRATION_DELETE)
  @ApiOperation({ summary: 'Disconnect and purge an integration connection' })
  async disconnect(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    await this.integrationsService.disconnect(id, orgId, wsId);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/execute')
  @RequirePermissions(Permission.INTEGRATION_UPDATE)
  @ApiOperation({ summary: 'Execute an integration action directly' })
  async executeAction(
    @Param('id') id: string,
    @Body('action') action: string,
    @Body('params') params: any,
  ) {
    return this.integrationsService.executeAction(id, action, params || {});
  }
}
