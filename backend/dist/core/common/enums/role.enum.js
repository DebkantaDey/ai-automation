"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceRole = exports.OrganizationRole = exports.SystemRole = void 0;
var SystemRole;
(function (SystemRole) {
    SystemRole["SUPER_ADMIN"] = "super_admin";
    SystemRole["SUPPORT"] = "support";
    SystemRole["USER"] = "user";
})(SystemRole || (exports.SystemRole = SystemRole = {}));
var OrganizationRole;
(function (OrganizationRole) {
    OrganizationRole["OWNER"] = "owner";
    OrganizationRole["ADMIN"] = "admin";
    OrganizationRole["MANAGER"] = "manager";
    OrganizationRole["OPERATOR"] = "operator";
    OrganizationRole["MEMBER"] = "member";
    OrganizationRole["BILLING_MANAGER"] = "billing_manager";
    OrganizationRole["VIEWER"] = "viewer";
})(OrganizationRole || (exports.OrganizationRole = OrganizationRole = {}));
var WorkspaceRole;
(function (WorkspaceRole) {
    WorkspaceRole["ADMIN"] = "admin";
    WorkspaceRole["EDITOR"] = "editor";
    WorkspaceRole["RUNNER"] = "runner";
    WorkspaceRole["VIEWER"] = "viewer";
})(WorkspaceRole || (exports.WorkspaceRole = WorkspaceRole = {}));
//# sourceMappingURL=role.enum.js.map