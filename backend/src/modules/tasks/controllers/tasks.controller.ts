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
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
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

@ApiTags('Operations - Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.TASKS_WRITE)
  @ApiOperation({ summary: 'Create a new operational task' })
  async createTask(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.TASKS_READ)
  @ApiOperation({ summary: 'List tasks with filters' })
  async listTasks(
    @CurrentOrganizationId() orgId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assigneeUserId') assigneeUserId?: string,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.tasksService.listTasks(orgId, {
      status,
      priority,
      assigneeUserId,
      customerId,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.TASKS_READ)
  @ApiOperation({ summary: 'Get task details' })
  async getTaskById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.getTaskById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id')
  @RequirePermissions(Permission.TASKS_WRITE)
  @ApiOperation({ summary: 'Update task properties or assignment' })
  async updateTask(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/complete')
  @RequirePermissions(Permission.TASKS_WRITE)
  @ApiOperation({ summary: 'Mark task as completed' })
  async completeTask(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.completeTask(orgId, id, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.TASKS_WRITE)
  @ApiOperation({ summary: 'Soft delete a task' })
  async deleteTask(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.deleteTask(orgId, id, userId);
  }
}
