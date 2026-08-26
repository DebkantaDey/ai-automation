import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InboxService } from '../services/inbox.service';
import {
  SendMessageDto,
  ToggleAiTakeoverDto,
  UpdateConversationDto,
} from '../dto/inbox.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../core/auth/guards/permissions.guard';
import {
  CurrentOrganizationId,
  CurrentUser,
  RequireTenant,
} from '../../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../../core/common/enums/permission.enum';

@ApiTags('Omnichannel Inbox')
@Controller('inbox')
export class InboxController {
  constructor(private readonly inboxService: InboxService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('conversations')
  @RequirePermissions(Permission.INBOX_READ)
  @ApiOperation({ summary: 'List omnichannel conversation threads' })
  async listConversations(
    @CurrentOrganizationId() orgId: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inboxService.listConversations(orgId, {
      channel,
      status,
      search,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('conversations/:id')
  @RequirePermissions(Permission.INBOX_READ)
  @ApiOperation({ summary: 'Get conversation details and contact metadata' })
  async getConversationById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.inboxService.getConversationById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('conversations/:id/messages')
  @RequirePermissions(Permission.INBOX_READ)
  @ApiOperation({ summary: 'Get chronological message history for a conversation thread' })
  async getMessages(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.inboxService.getMessages(orgId, id, limit ? Number(limit) : 50);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('conversations/:id/messages')
  @RequirePermissions(Permission.INBOX_WRITE)
  @ApiOperation({ summary: 'Send message reply to customer' })
  async sendMessage(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.inboxService.sendMessage(orgId, id, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('conversations/:id/takeover')
  @RequirePermissions(Permission.INBOX_WRITE)
  @ApiOperation({ summary: 'Toggle Human Agent Takeover vs Autonomous AI handling' })
  async toggleTakeover(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ToggleAiTakeoverDto,
  ) {
    return this.inboxService.toggleTakeover(orgId, id, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('conversations/:id/suggest-reply')
  @RequirePermissions(Permission.INBOX_READ)
  @ApiOperation({ summary: 'Generate AI suggested reply draft' })
  async suggestReply(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.inboxService.suggestReply(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch('conversations/:id')
  @RequirePermissions(Permission.INBOX_WRITE)
  @ApiOperation({ summary: 'Update conversation status or assignment' })
  async updateConversation(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.inboxService.updateConversation(orgId, id, userId, dto);
  }
}
