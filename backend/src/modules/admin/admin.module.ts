import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Organization, OrganizationSchema } from '../organizations/schemas/organization.schema';
import { Subscription, SubscriptionSchema } from '../billing/schemas/subscription.schema';
import { Workflow, WorkflowSchema } from '../workflows/schemas/workflow.schema';
import { WorkflowExecution, WorkflowExecutionSchema } from '../workflows/schemas/workflow-execution.schema';
import { AuditLog, AuditLogSchema } from '../audit-logs/schemas/audit-log.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Workflow.name, schema: WorkflowSchema },
      { name: WorkflowExecution.name, schema: WorkflowExecutionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, SuperAdminGuard],
  exports: [AdminService, SuperAdminGuard],
})
export class AdminModule {}
