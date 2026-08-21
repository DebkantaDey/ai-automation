"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const organizations_service_1 = require("./organizations.service");
const organizations_controller_1 = require("./organizations.controller");
const organization_audit_hooks_1 = require("./organization-audit.hooks");
const organization_schema_1 = require("./schemas/organization.schema");
const organization_member_schema_1 = require("./schemas/organization-member.schema");
const organization_invitation_schema_1 = require("./schemas/organization-invitation.schema");
const workspace_schema_1 = require("../workspaces/schemas/workspace.schema");
const user_schema_1 = require("../users/schemas/user.schema");
const auth_module_1 = require("../../core/auth/auth.module");
const roles_module_1 = require("../roles/roles.module");
let OrganizationsModule = class OrganizationsModule {
};
exports.OrganizationsModule = OrganizationsModule;
exports.OrganizationsModule = OrganizationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: organization_schema_1.Organization.name, schema: organization_schema_1.OrganizationSchema },
                { name: organization_member_schema_1.OrganizationMember.name, schema: organization_member_schema_1.OrganizationMemberSchema },
                { name: organization_invitation_schema_1.OrganizationInvitation.name, schema: organization_invitation_schema_1.OrganizationInvitationSchema },
                { name: workspace_schema_1.Workspace.name, schema: workspace_schema_1.WorkspaceSchema },
                { name: user_schema_1.User.name, schema: user_schema_1.UserSchema },
            ]),
            auth_module_1.AuthModule,
            roles_module_1.RolesModule,
        ],
        controllers: [organizations_controller_1.OrganizationsController],
        providers: [organizations_service_1.OrganizationsService, organization_audit_hooks_1.OrganizationAuditHooks],
        exports: [organizations_service_1.OrganizationsService, organization_audit_hooks_1.OrganizationAuditHooks],
    })
], OrganizationsModule);
//# sourceMappingURL=organizations.module.js.map