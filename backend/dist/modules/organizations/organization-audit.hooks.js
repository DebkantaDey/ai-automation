"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OrganizationAuditHooks_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationAuditHooks = void 0;
const common_1 = require("@nestjs/common");
let OrganizationAuditHooks = OrganizationAuditHooks_1 = class OrganizationAuditHooks {
    logger = new common_1.Logger(OrganizationAuditHooks_1.name);
    async emit(payload) {
        const event = {
            ...payload,
            timestamp: payload.timestamp || new Date(),
        };
        this.logger.log(`[AUDIT HOOK] Event: ${event.eventType} | Org: ${event.organizationId} | Actor: ${event.actorUserId} | Data: ${JSON.stringify(event.metadata || {})}`);
    }
};
exports.OrganizationAuditHooks = OrganizationAuditHooks;
exports.OrganizationAuditHooks = OrganizationAuditHooks = OrganizationAuditHooks_1 = __decorate([
    (0, common_1.Injectable)()
], OrganizationAuditHooks);
//# sourceMappingURL=organization-audit.hooks.js.map