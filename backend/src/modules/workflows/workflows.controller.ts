import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto, TriggerExecutionDto } from './dto/create-workflow.dto';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, Public, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';

@ApiTags('Workflows & Executions')
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Create a new workflow' })
  async create(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('generate-from-prompt')
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Generate structured workflow DAG from natural language instructions' })
  async generateFromPrompt(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('prompt') prompt: string,
  ) {
    return this.workflowsService.generateFromNaturalLanguage(orgId, wsId, userId, prompt);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List workflows with pagination and search' })
  async list(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.workflowsService.list(orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('executions')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List all workflow executions for workspace' })
  async listExecutions(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.workflowsService.listExecutions(orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('dlq')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List dead-letter queue failed executions requiring operator review' })
  async listDeadLetterQueue(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.workflowsService.listDeadLetterQueue(orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('dlq/:executionId/retry')
  @RequirePermissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Retry a failed dead-lettered workflow execution' })
  async retryDeadLetterJob(
    @Param('executionId') executionId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.workflowsService.retryDeadLetterJob(executionId, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('dlq/:executionId/cancel')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Cancel/discard a failed dead-lettered workflow execution' })
  async cancelDeadLetterJob(
    @Param('executionId') executionId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.workflowsService.cancelDeadLetterJob(executionId, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('executions/:executionId')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get workflow execution details and node step traces' })
  async getExecutionById(
    @Param('executionId') executionId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.workflowsService.getExecutionById(executionId, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('executions/:executionId/approve')
  @RequirePermissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Approve a paused workflow execution and resume downstream nodes' })
  async approveExecution(
    @Param('executionId') executionId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.workflowsService.approveExecution(executionId, orgId, wsId, userId, reason);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('executions/:executionId/reject')
  @RequirePermissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Reject a paused workflow execution and cancel run' })
  async rejectExecution(
    @Param('executionId') executionId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('reason') reason?: string,
  ) {
    return this.workflowsService.rejectExecution(executionId, orgId, wsId, userId, reason);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get workflow by ID' })
  async findById(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.workflowsService.findById(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Put(':id')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Update workflow configuration and canvas graph' })
  async update(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Body() updates: Partial<CreateWorkflowDto> & { status?: string },
  ) {
    return this.workflowsService.update(id, orgId, wsId, updates);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id/status')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Update workflow status lifecycle (active, paused, disabled, archived)' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Body('status') status: 'draft' | 'active' | 'paused' | 'disabled' | 'archived',
  ) {
    return this.workflowsService.updateStatus(id, orgId, wsId, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/publish')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Publish an immutable workflow version and activate' })
  async publish(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('changelog') changelog?: string,
  ) {
    return this.workflowsService.publish(id, orgId, wsId, userId, changelog);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id/versions')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List all historical published versions of this workflow' })
  async listVersions(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.workflowsService.listVersions(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/versions/:version/rollback')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Rollback draft canvas graph to a specific historical version' })
  async rollbackVersion(
    @Param('id') id: string,
    @Param('version') version: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.workflowsService.rollbackVersion(id, parseInt(version, 10), orgId, wsId, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/duplicate')
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Duplicate an existing workflow as a new draft' })
  async duplicate(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body('name') name?: string,
  ) {
    return this.workflowsService.duplicate(id, orgId, wsId, userId, name);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/execute')
  @RequirePermissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Trigger a workflow execution manually' })
  async execute(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: TriggerExecutionDto,
  ) {
    return this.workflowsService.triggerExecution(id, orgId, wsId, userId, dto);
  }

  @Public()
  @Post('trigger/webhook/:webhookId')
  @ApiOperation({ summary: 'Inbound public webhook trigger endpoint' })
  async triggerByWebhook(
    @Param('webhookId') webhookId: string,
    @Body() payload: Record<string, any>,
  ) {
    return this.workflowsService.triggerByWebhook(webhookId, payload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('dlq/jobs')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List dead letter queue failed executions' })
  async listDeadLetterJobs(
    @CurrentOrganizationId() orgId: string,
    @Query('status') status?: string,
    @Query('workflowId') workflowId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.workflowsService.getDeadLetterQueueService()?.listDeadLetterJobs(orgId, {
      status,
      workflowId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('dlq/jobs/:id')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get details of dead letter queue job' })
  async getDeadLetterJob(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.getDeadLetterQueueService()?.getDeadLetterJob(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('dlq/jobs/:id/replay')
  @RequirePermissions(Permission.WORKFLOW_EXECUTE)
  @ApiOperation({ summary: 'Replay dead letter job via BullMQ' })
  async replayDeadLetterJob(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('customPayload') customPayload?: Record<string, any>,
  ) {
    return this.workflowsService.getDeadLetterQueueService()?.replayJob(orgId, id, userId, customPayload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('dlq/jobs/:id/dismiss')
  @RequirePermissions(Permission.WORKFLOW_UPDATE)
  @ApiOperation({ summary: 'Dismiss dead letter job' })
  async dismissDeadLetterJob(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.getDeadLetterQueueService()?.dismissJob(orgId, id, userId);
  }
}
