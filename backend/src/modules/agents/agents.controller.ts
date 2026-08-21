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
import { AgentsService, CreateAgentDto } from './agents.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@ApiTags('Autonomous AI Agents')
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Create a new autonomous AI agent' })
  async create(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAgentDto,
  ) {
    return this.agentsService.createAgent(orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List all agents for current workspace' })
  async list(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.agentsService.listAgents(orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get agent configuration and tools by ID' })
  async getById(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.agentsService.getAgentById(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Put(':id')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Update agent instructions, tools, or limits' })
  async update(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Body() updates: Partial<CreateAgentDto> & { status?: string },
  ) {
    return this.agentsService.updateAgent(id, orgId, wsId, updates);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.WORKFLOW_DELETE)
  @ApiOperation({ summary: 'Delete or archive agent' })
  async delete(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    await this.agentsService.deleteAgent(id, orgId, wsId);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/run')
  @RequirePermissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Execute autonomous agent ReAct loop with user input prompt' })
  async runAgent(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('inputPrompt') inputPrompt: string,
  ) {
    return this.agentsService.runAgent(id, orgId, wsId, userId, inputPrompt);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id/executions')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List reasoning step executions for agent' })
  async listExecutions(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.agentsService.listExecutions(id, orgId, wsId, pagination);
  }
}
