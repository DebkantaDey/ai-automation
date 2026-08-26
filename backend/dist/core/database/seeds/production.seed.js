"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProductionDatabase = seedProductionDatabase;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const argon2 = require("argon2");
const app_module_1 = require("../../../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const role_schema_1 = require("../../../modules/roles/schemas/role.schema");
const user_schema_1 = require("../../../modules/users/schemas/user.schema");
const organization_schema_1 = require("../../../modules/organizations/schemas/organization.schema");
const workspace_schema_1 = require("../../../modules/workspaces/schemas/workspace.schema");
const plan_schema_1 = require("../../../modules/billing/schemas/plan.schema");
const subscription_schema_1 = require("../../../modules/billing/schemas/subscription.schema");
const lead_schema_1 = require("../../../modules/crm/schemas/lead.schema");
const customer_schema_1 = require("../../../modules/crm/schemas/customer.schema");
const deal_schema_1 = require("../../../modules/crm/schemas/deal.schema");
const agent_schema_1 = require("../../../modules/agents/schemas/agent.schema");
const workflow_schema_1 = require("../../../modules/workflows/schemas/workflow.schema");
const permission_enum_1 = require("../../common/enums/permission.enum");
async function seedProductionDatabase() {
    const logger = new common_1.Logger('ProductionSeeder');
    logger.log('Starting multi-tenant database seed process...');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const roleModel = app.get((0, mongoose_1.getModelToken)(role_schema_1.Role.name));
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const orgModel = app.get((0, mongoose_1.getModelToken)(organization_schema_1.Organization.name));
    const wsModel = app.get((0, mongoose_1.getModelToken)(workspace_schema_1.Workspace.name));
    const planModel = app.get((0, mongoose_1.getModelToken)(plan_schema_1.Plan.name));
    const subModel = app.get((0, mongoose_1.getModelToken)(subscription_schema_1.Subscription.name));
    const leadModel = app.get((0, mongoose_1.getModelToken)(lead_schema_1.Lead.name));
    const custModel = app.get((0, mongoose_1.getModelToken)(customer_schema_1.Customer.name));
    const dealModel = app.get((0, mongoose_1.getModelToken)(deal_schema_1.Deal.name));
    const agentModel = app.get((0, mongoose_1.getModelToken)(agent_schema_1.Agent.name));
    const workflowModel = app.get((0, mongoose_1.getModelToken)(workflow_schema_1.Workflow.name));
    logger.log('Seeding system RBAC roles...');
    for (const [roleName, permissions] of Object.entries(permission_enum_1.SystemRolePermissions)) {
        const existing = await roleModel.findOne({ name: roleName, isSystem: true });
        if (!existing) {
            await roleModel.create({
                name: roleName,
                description: `System defined ${roleName} role`,
                permissions: permissions.includes('*') ? permission_enum_1.ALL_PERMISSIONS : permissions,
                isSystem: true,
            });
            logger.log(`Created system role: [${roleName}]`);
        }
    }
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
//# sourceMappingURL=production.seed.js.map