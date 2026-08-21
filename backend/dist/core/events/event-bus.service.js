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
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const events_1 = require("events");
const webhooks_service_1 = require("../../modules/webhooks/webhooks.service");
let EventBusService = EventBusService_1 = class EventBusService {
    webhooksService;
    logger = new common_1.Logger(EventBusService_1.name);
    emitter = new events_1.EventEmitter();
    constructor(webhooksService) {
        this.webhooksService = webhooksService;
        this.emitter.setMaxListeners(50);
    }
    on(eventType, listener) {
        this.emitter.on(eventType, listener);
    }
    async emit(eventType, organizationId, workspaceId, data = {}) {
        const event = {
            id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: eventType,
            organizationId,
            workspaceId,
            timestamp: new Date(),
            data,
        };
        this.logger.log(`[EventBus] Emitted [${eventType}] for Org [${organizationId || 'global'}]`);
        this.emitter.emit(eventType, event);
        this.emitter.emit('*', event);
        if (this.webhooksService && organizationId) {
            try {
                await this.webhooksService.dispatchOutboundEvent(organizationId, workspaceId || '', eventType, {
                    eventId: event.id,
                    eventType: event.type,
                    timestamp: event.timestamp.toISOString(),
                    data: event.data,
                });
            }
            catch (err) {
                this.logger.warn(`Failed to dispatch event [${eventType}] to outbound webhooks: ${err.message}`);
            }
        }
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [webhooks_service_1.WebhooksService])
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map