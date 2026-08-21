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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsStreamController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const event_bus_service_1 = require("../../core/events/event-bus.service");
const jwt_auth_guard_1 = require("../../core/auth/guards/jwt-auth.guard");
const tenant_decorators_1 = require("../../core/tenancy/tenant.decorators");
let EventsStreamController = class EventsStreamController {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    streamEvents(orgId) {
        return new rxjs_1.Observable((subscriber) => {
            const listener = (event) => {
                if (!event.organizationId || event.organizationId === orgId) {
                    subscriber.next({
                        data: {
                            type: event.type,
                            timestamp: event.timestamp.toISOString(),
                            payload: event.data,
                        },
                    });
                }
            };
            this.eventBus.on('*', listener);
            const heartbeat = setInterval(() => {
                subscriber.next({
                    data: {
                        type: 'system.heartbeat',
                        timestamp: new Date().toISOString(),
                    },
                });
            }, 30000);
            return () => {
                clearInterval(heartbeat);
            };
        });
    }
};
exports.EventsStreamController = EventsStreamController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, tenant_decorators_1.RequireTenant)(),
    (0, common_1.Sse)('stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Subscribe to real-time Server-Sent Events (SSE) stream for active organization' }),
    __param(0, (0, tenant_decorators_1.CurrentOrganizationId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], EventsStreamController.prototype, "streamEvents", null);
exports.EventsStreamController = EventsStreamController = __decorate([
    (0, swagger_1.ApiTags)('Real-Time Events Stream'),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], EventsStreamController);
//# sourceMappingURL=events-stream.controller.js.map