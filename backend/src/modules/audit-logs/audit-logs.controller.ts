import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { CurrentOrganizationId, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { OrganizationRole } from '../../core/common/enums/role.enum';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireTenant()
@Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List organization audit logs with search and pagination' })
  async list(
    @CurrentOrganizationId() orgId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.auditLogsService.list(orgId, pagination);
  }
}
