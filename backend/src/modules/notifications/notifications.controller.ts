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
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @ApiOperation({ summary: 'List in-app notifications with unread count' })
  async list(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.notificationsService.listNotifications(orgId, wsId, userId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark specific notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.notificationsService.markAsRead(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationsService.markAllAsRead(orgId, userId);
    return { success: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('preferences')
  @ApiOperation({ summary: 'Get current notification channel and event preferences' })
  async getPreferences(
    @CurrentUser('id') userId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.notificationsService.getPreferences(userId, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Put('preferences')
  @ApiOperation({ summary: 'Update notification channel and event preferences' })
  async updatePreferences(
    @CurrentUser('id') userId: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Body() updates: any,
  ) {
    return this.notificationsService.updatePreferences(userId, orgId, wsId, updates);
  }
}
