import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { KnowledgeBaseService, CreateKnowledgeBaseDto, AddDocumentDto } from './knowledge-base.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/auth/guards/permissions.guard';
import { CurrentOrganizationId, CurrentWorkspaceId, CurrentUser, RequireTenant } from '../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../core/common/enums/permission.enum';
import { PaginationQueryDto } from '../../core/common/dto/pagination.dto';

@ApiTags('Knowledge Base & Vector RAG')
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly kbService: KnowledgeBaseService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Create a new knowledge base collection' })
  async create(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateKnowledgeBaseDto,
  ) {
    return this.kbService.createKnowledgeBase(orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List all knowledge bases in workspace' })
  async list(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.kbService.listKnowledgeBases(orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Get knowledge base details and document counts' })
  async getById(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
  ) {
    return this.kbService.getKnowledgeBaseById(id, orgId, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/documents')
  @RequirePermissions(Permission.WORKFLOW_CREATE)
  @ApiOperation({ summary: 'Add document and enqueue background chunking & vector indexing' })
  async addDocument(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddDocumentDto,
  ) {
    return this.kbService.addDocument(id, orgId, wsId, userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id/documents')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'List documents and indexing statuses for knowledge base' })
  async listDocuments(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Query() pagination: PaginationQueryDto,
  ) {
    return this.kbService.listDocuments(id, orgId, wsId, pagination);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post(':id/query')
  @RequirePermissions(Permission.WORKFLOW_READ)
  @ApiOperation({ summary: 'Ask question with vector similarity retrieval and RAG synthesis' })
  async askQuestion(
    @Param('id') id: string,
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @Body('question') question: string,
  ) {
    return this.kbService.askQuestion(id, orgId, wsId, question);
  }
}
