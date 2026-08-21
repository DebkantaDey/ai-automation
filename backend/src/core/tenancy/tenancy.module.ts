import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantContextService } from './tenant-context.service';
import { TenantInterceptor } from './tenant.interceptor';
import { TenantGuard } from './tenant.guard';
import { OrganizationMember, OrganizationMemberSchema } from '../../modules/organizations/schemas/organization-member.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
    ]),
  ],
  providers: [
    TenantContextService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [TenantContextService, MongooseModule],
})
export class TenancyModule {}
