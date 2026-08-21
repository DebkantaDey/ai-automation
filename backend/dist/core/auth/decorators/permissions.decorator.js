"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirePermission = exports.RequirePermissions = exports.PERMISSIONS_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.PERMISSIONS_KEY = 'permissions';
const RequirePermissions = (...permissions) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, permissions);
exports.RequirePermissions = RequirePermissions;
const RequirePermission = (permission) => (0, common_1.SetMetadata)(exports.PERMISSIONS_KEY, [permission]);
exports.RequirePermission = RequirePermission;
//# sourceMappingURL=permissions.decorator.js.map