"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const webhooks_controller_1 = require("./webhooks.controller");
const webhooks_service_1 = require("./webhooks.service");
const webhook_dispatch_processor_1 = require("./processors/webhook-dispatch.processor");
const webhook_endpoint_schema_1 = require("./schemas/webhook-endpoint.schema");
const webhook_delivery_schema_1 = require("./schemas/webhook-delivery.schema");
const queue_constants_1 = require("../../core/queue/queue.constants");
let WebhooksModule = class WebhooksModule {
};
exports.WebhooksModule = WebhooksModule;
exports.WebhooksModule = WebhooksModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: webhook_endpoint_schema_1.WebhookEndpoint.name, schema: webhook_endpoint_schema_1.WebhookEndpointSchema },
                { name: webhook_delivery_schema_1.WebhookDelivery.name, schema: webhook_delivery_schema_1.WebhookDeliverySchema },
            ]),
            bullmq_1.BullModule.registerQueue({
                name: queue_constants_1.QUEUE_WEBHOOK_DISPATCH,
            }),
        ],
        controllers: [webhooks_controller_1.WebhooksController],
        providers: [webhooks_service_1.WebhooksService, webhook_dispatch_processor_1.WebhookDispatchProcessor],
        exports: [webhooks_service_1.WebhooksService, mongoose_1.MongooseModule],
    })
], WebhooksModule);
//# sourceMappingURL=webhooks.module.js.map