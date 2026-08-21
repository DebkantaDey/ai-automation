import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UseGuards,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrivacyService } from './privacy.service';
import { JwtAuthGuard } from '../../core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../core/auth/guards/roles.guard';
import { Roles } from '../../core/auth/decorators/roles.decorator';
import { OrganizationRole } from '../../core/common/enums/role.enum';
import { CurrentUser, CurrentOrganizationId, RequireTenant } from '../../core/tenancy/tenant.decorators';

@ApiTags('Privacy & Compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Get('export/user')
  @ApiOperation({ summary: 'Export user account data portability package (GDPR Article 20)' })
  async exportUserData(@CurrentUser('id') userId: string) {
    return this.privacyService.exportUserData(userId);
  }

  @Get('export/organization')
  @RequireTenant()
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.OWNER, OrganizationRole.ADMIN)
  @ApiOperation({ summary: 'Export organization data package (Workflows, Executions, Documents)' })
  async exportOrgData(@CurrentOrganizationId() orgId: string) {
    return this.privacyService.exportOrganizationData(orgId);
  }

  @Get('consent')
  @ApiOperation({ summary: 'Get current user privacy consent settings' })
  async getConsent(@CurrentUser('id') userId: string) {
    const consent = await this.privacyService.getConsent(userId);
    return consent || { analyticsConsent: true, marketingConsent: false, dataProcessingConsent: true };
  }

  @Post('consent')
  @ApiOperation({ summary: 'Update user GDPR / CCPA consent settings' })
  async updateConsent(
    @CurrentUser('id') userId: string,
    @Body() dto: { analyticsConsent?: boolean; marketingConsent?: boolean; dataProcessingConsent?: boolean },
    @Ip() ipAddress: string,
  ) {
    return this.privacyService.updateConsent(userId, { ...dto, ipAddress });
  }

  @Delete('account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete user account and personal data (Right to be Forgotten)' })
  async deleteAccount(@CurrentUser('id') userId: string) {
    return this.privacyService.deleteUserAccount(userId);
  }

  @Delete('organization')
  @RequireTenant()
  @UseGuards(RolesGuard)
  @Roles(OrganizationRole.OWNER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete organization and cascade purge all workspaces & workflows' })
  async deleteOrganization(@CurrentOrganizationId() orgId: string) {
    return this.privacyService.deleteOrganization(orgId);
  }
}
