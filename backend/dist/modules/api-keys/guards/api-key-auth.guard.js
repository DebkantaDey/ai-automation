"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyAuthGuard = exports.RequireScopes = exports.SCOPES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const api_keys_service_1 = require("../api-keys.service");
exports.SCOPES_KEY = 'required_scopes';
const RequireScopes = (...scopes) => {
    return (target, key, descriptor) => {
        if (descriptor) {
            Reflect.defineMetadata(exports.SCOPES_KEY, scopes, descriptor.value);
            return descriptor;
        }
        Reflect.defineMetadata(exports.SCOPES_KEY, scopes, target);
        return target;
    };
};
exports.RequireScopes = RequireScopes;
let ApiKeyAuthGuard = class ApiKeyAuthGuard {
    apiKeysService;
    reflector;
    constructor(apiKeysService, reflector) {
        this.apiKeysService = apiKeysService;
        this.reflector = reflector;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        let rawKey = request.headers['x-api-key'];
        if (!rawKey && request.headers.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ak_live_')) {
                rawKey = authHeader.substring(7);
            }
        }
        if (!rawKey) {
            throw new common_1.UnauthorizedException('Missing X-API-Key or Bearer token header');
        }
        const apiKey = await this.apiKeysService.validateKey(rawKey);
        request.tenant = {
            organizationId: apiKey.organizationId.toString(),
            workspaceId: apiKey.workspaceId.toString(),
        };
        request.user = {
            id: apiKey.createdBy?.toString() || 'api-key-client',
            organizationId: apiKey.organizationId.toString(),
            workspaceId: apiKey.workspaceId.toString(),
            isApiKey: true,
            apiKeyId: apiKey._id.toString(),
            scopes: apiKey.scopes,
        };
        const requiredScopes = this.reflector.getAllAndOverride(exports.SCOPES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (requiredScopes && requiredScopes.length > 0) {
            const hasWildcard = apiKey.scopes.includes('*');
            const hasAllScopes = requiredScopes.every((scope) => apiKey.scopes.includes(scope));
            if (!hasWildcard && !hasAllScopes) {
                throw new common_1.ForbiddenException(`API Key lacks required scopes: [${requiredScopes.join(', ')}]`);
            }
        }
        return true;
    }
};
exports.ApiKeyAuthGuard = ApiKeyAuthGuard;
exports.ApiKeyAuthGuard = ApiKeyAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService,
        core_1.Reflector])
], ApiKeyAuthGuard);
//# sourceMappingURL=api-key-auth.guard.js.map