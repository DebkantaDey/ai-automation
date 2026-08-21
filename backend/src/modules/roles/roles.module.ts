import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { Role, RoleSchema } from './schemas/role.schema';
import { OrganizationMember, OrganizationMemberSchema } from '../organizations/schemas/organization-member.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService, MongooseModule],
})
export class RolesModule {}
