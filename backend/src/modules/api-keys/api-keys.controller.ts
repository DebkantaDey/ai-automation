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
import { ApiKeysService, CreateApiKeyDto } from './api-keys.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@ApiTags('API Keys')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.API_MANAGE)
  @ApiOperation({ summary: 'Create a new scoped API key (secret key returned once)' })
  async create(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateApiKeyDto,
  ) {
    return this.apiKeysService.createApiKey(orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.API_READ)
  @ApiOperation({ summary: 'List API keys in workspace' })
  async list(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.apiKeysService.listApiKeys(orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.API_MANAGE)
  @ApiOperation({ summary: 'Revoke an API key immediately' })
  async revoke(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.apiKeysService.revokeApiKey(id, orgId, wsId, userId);
  }
}
