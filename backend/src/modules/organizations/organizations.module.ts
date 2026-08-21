import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationAuditHooks } from './organization-audit.hooks';
import { Organization, OrganizationSchema } from './schemas/organization.schema';
import { OrganizationMember, OrganizationMemberSchema } from './schemas/organization-member.schema';
import {
  OrganizationInvitation,
  OrganizationInvitationSchema,
} from './schemas/organization-invitation.schema';
import { Workspace, WorkspaceSchema } from '../workspaces/schemas/workspace.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { AuthModule } from '../../core/auth/auth.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: OrganizationInvitation.name, schema: OrganizationInvitationSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuthModule,
    RolesModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationAuditHooks],
  exports: [OrganizationsService, OrganizationAuditHooks],
})
export class OrganizationsModule {}
