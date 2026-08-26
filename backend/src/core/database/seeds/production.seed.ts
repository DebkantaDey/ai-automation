import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AppModule } from '../../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from '../../../modules/roles/schemas/role.schema';
import { User, UserDocument } from '../../../modules/users/schemas/user.schema';
import { Organization, OrganizationDocument } from '../../../modules/organizations/schemas/organization.schema';
import { Workspace, WorkspaceDocument } from '../../../modules/workspaces/schemas/workspace.schema';
import { Plan, PlanDocument } from '../../../modules/billing/schemas/plan.schema';
import { Subscription, SubscriptionDocument } from '../../../modules/billing/schemas/subscription.schema';
import { Lead, LeadDocument } from '../../../modules/crm/schemas/lead.schema';
import { Customer, CustomerDocument } from '../../../modules/crm/schemas/customer.schema';
import { Deal, DealDocument } from '../../../modules/crm/schemas/deal.schema';
import { Agent, AgentDocument } from '../../../modules/agents/schemas/agent.schema';
import { Workflow, WorkflowDocument } from '../../../modules/workflows/schemas/workflow.schema';
import { ALL_PERMISSIONS, SystemRolePermissions } from '../../common/enums/permission.enum';

async function seedProductionDatabase() {
  const logger = new Logger('ProductionSeeder');
  logger.log('Starting multi-tenant database seed process...');

  const app = await NestFactory.createApplicationContext(AppModule);

  const roleModel = app.get<Model<RoleDocument>>(getModelToken(Role.name));
  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const orgModel = app.get<Model<OrganizationDocument>>(getModelToken(Organization.name));
  const wsModel = app.get<Model<WorkspaceDocument>>(getModelToken(Workspace.name));
  const planModel = app.get<Model<PlanDocument>>(getModelToken(Plan.name));
  const subModel = app.get<Model<SubscriptionDocument>>(getModelToken(Subscription.name));
  const leadModel = app.get<Model<LeadDocument>>(getModelToken(Lead.name));
  const custModel = app.get<Model<CustomerDocument>>(getModelToken(Customer.name));
  const dealModel = app.get<Model<DealDocument>>(getModelToken(Deal.name));
  const agentModel = app.get<Model<AgentDocument>>(getModelToken(Agent.name));
  const workflowModel = app.get<Model<WorkflowDocument>>(getModelToken(Workflow.name));

  // 1. Seed System Roles
  logger.log('Seeding system RBAC roles...');
  for (const [roleName, permissions] of Object.entries(SystemRolePermissions)) {
    const existing = await roleModel.findOne({ name: roleName, isSystem: true });
    if (!existing) {
      await roleModel.create({
        name: roleName,
        description: `System defined ${roleName} role`,
        permissions: permissions.includes('*') ? ALL_PERMISSIONS : permissions,
        isSystem: true,
      });
      logger.log(`Created system role: [${roleName}]`);
    }
  }

  // 2. Seed SaaS Plans
  logger.log('Seeding SaaS billing plans...');
  const defaultPlans = [
    { name: 'Free', slug: 'free', priceMonthly: 0, priceYearly: 0, currency: 'USD', limits: { maxWorkspaces: 1, maxWorkflows: 3, maxMonthlyExecutions: 100, maxTeamMembers: 2 } },
    { name: 'Starter', slug: 'starter', priceMonthly: 29, priceYearly: 290, currency: 'USD', limits: { maxWorkspaces: 3, maxWorkflows: 15, maxMonthlyExecutions: 2500, maxTeamMembers: 5 } },
    { name: 'Business', slug: 'business', priceMonthly: 99, priceYearly: 990, currency: 'USD', limits: { maxWorkspaces: 10, maxWorkflows: 50, maxMonthlyExecutions: 15000, maxTeamMembers: 20 } },
    { name: 'Enterprise', slug: 'enterprise', priceMonthly: 299, priceYearly: 2990, currency: 'USD', limits: { maxWorkspaces: 50, maxWorkflows: 500, maxMonthlyExecutions: 100000, maxTeamMembers: 100 } },
  ];

  for (const planData of defaultPlans) {
    const existing = await planModel.findOne({ slug: planData.slug });
    if (!existing) {
      await planModel.create({ ...planData, isActive: true });
      logger.log(`Created SaaS billing plan: [${planData.name}]`);
    }
  }

  // 3. Seed Demo Organization
  logger.log('Seeding demo organization: Acme Corp...');
  let org = await orgModel.findOne({ slug: 'acme-corp' });
  if (!org) {
    org = await orgModel.create({
      name: 'Acme Corp',
      slug: 'acme-corp',
      status: 'active',
      plan: 'business',
    });
    logger.log(`Created organization: [${org.name}] (ID: ${org._id})`);
  }

  // 4. Seed Default Workspace
  let ws = await wsModel.findOne({ organizationId: org._id, slug: 'default' });
  if (!ws) {
    ws = await wsModel.create({
      organizationId: org._id,
      name: 'Default Workspace',
      slug: 'default',
      isDefault: true,
      status: 'active',
    });
    logger.log(`Created default workspace: [${ws.name}]`);
  }

  // 5. Seed Superadmin User
  const adminEmail = 'admin@automa.ai';
  let adminUser = await userModel.findOne({ email: adminEmail });
  if (!adminUser) {
    const passwordHash = await argon2.hash('Admin@123456');
    adminUser = await userModel.create({
      email: adminEmail,
      passwordHash,
      firstName: 'System',
      lastName: 'Administrator',
      isEmailVerified: true,
      role: 'owner',
      status: 'active',
    });
    logger.log(`Created default administrator user: [${adminEmail}]`);
  }

  // 6. Seed Sample CRM Customer & Leads
  const existingCust = await custModel.findOne({ organizationId: org._id, email: 'contact@globallogistics.com' });
  if (!existingCust) {
    const cust = await custModel.create({
      organizationId: org._id,
      workspaceId: ws._id,
      name: 'Sarah Jenkins',
      company: 'Global Logistics Corp',
      email: 'contact@globallogistics.com',
      phone: '+1 (555) 234-5678',
      tier: 'enterprise',
      status: 'active',
      totalSpend: 48000,
      tags: ['logistics', 'enterprise', 'vip'],
    });
    logger.log(`Created sample customer: [${cust.name}]`);

    await dealModel.create({
      organizationId: org._id,
      workspaceId: ws._id,
      customerId: cust._id,
      title: 'Global Supply Chain AI Automation Expansion',
      value: 75000,
      currency: 'USD',
      stage: 'proposal',
      probability: 70,
      expectedCloseDate: new Date(Date.now() + 30 * 86400000),
    });
  }

  // 7. Seed Sample Autonomous AI Agent
  const existingAgent = await agentModel.findOne({ organizationId: org._id, name: 'Operations Support AI' });
  if (!existingAgent) {
    await agentModel.create({
      organizationId: org._id,
      workspaceId: ws._id,
      name: 'Operations Support AI',
      description: 'Autonomous assistant for customer inquiries, lead qualification, and scheduling.',
      instructions: 'You are the primary operational assistant for Acme Corp. Help clients with bookings and inquiries.',
      provider: 'openai',
      model: 'gpt-4o',
      tools: [
        { name: 'lookup_customer', description: 'Look up customer profile', enabled: true },
        { name: 'book_appointment', description: 'Schedule calendar appointment', enabled: true },
        { name: 'create_invoice', description: 'Generate customer invoice', enabled: true },
      ],
      createdBy: adminUser._id,
    });
    logger.log('Created sample autonomous AI Agent: [Operations Support AI]');
  }

  logger.log('Production database seeding completed successfully!');
  await app.close();
}

if (require.main === module) {
  seedProductionDatabase().catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

export { seedProductionDatabase };
