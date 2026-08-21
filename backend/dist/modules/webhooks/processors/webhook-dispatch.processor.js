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
var WebhookDispatchProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDispatchProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const axios_1 = require("axios");
const crypto = require("crypto");
const queue_constants_1 = require("../../../core/queue/queue.constants");
const webhook_delivery_schema_1 = require("../schemas/webhook-delivery.schema");
let WebhookDispatchProcessor = WebhookDispatchProcessor_1 = class WebhookDispatchProcessor extends bullmq_1.WorkerHost {
    deliveryModel;
    logger = new common_1.Logger(WebhookDispatchProcessor_1.name);
    constructor(deliveryModel) {
        super();
        this.deliveryModel = deliveryModel;
    }
    async process(job) {
        const { organizationId, workspaceId, endpointId, url, secret, eventId, eventType, payload } = job.data;
        const attempt = job.attemptsMade + 1;
        const timestamp = Math.floor(Date.now() / 1000);
        const serializedPayload = JSON.stringify(payload);
        const signaturePayload = `${timestamp}.${serializedPayload}`;
        const hmac = crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex');
        const signatureHeader = `t=${timestamp},v1=${hmac}`;
        const startTime = Date.now();
        let httpStatusCode = 0;
        let responseBody = '';
        let status = 'delivered';
        let errorMsg;
        try {
            this.logger.log(`Dispatching webhook [${eventType}] to [${url}] (Attempt ${attempt})`);
            const res = await axios_1.default.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AutomationSaaS-Webhook/1.0',
                    'X-Webhook-Signature': signatureHeader,
                    'X-Webhook-Event': eventType,
                    'X-Webhook-Id': eventId,
                    'X-Webhook-Timestamp': String(timestamp),
                },
                timeout: 10000,
            });
            httpStatusCode = res.status;
            responseBody = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
            status = 'delivered';
        }
        catch (err) {
            httpStatusCode = err.response?.status || 500;
            responseBody = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : '';
            errorMsg = err.message;
            status = attempt >= (job.opts.attempts || 5) ? 'failed' : 'retrying';
            this.logger.warn(`Webhook delivery failed for [${url}]: ${err.message} (HTTP ${httpStatusCode})`);
        }
        finally {
            const durationMs = Date.now() - startTime;
            await this.deliveryModel.create({
                organizationId: new mongoose_2.Types.ObjectId(organizationId),
                workspaceId: new mongoose_2.Types.ObjectId(workspaceId),
                endpointId: new mongoose_2.Types.ObjectId(endpointId),
                eventId,
                eventType,
                payload,
                status,
                attempts: attempt,
                httpStatusCode,
                responseBody: responseBody.slice(0, 1000),
                durationMs,
                error: errorMsg,
                nextRetryAt: status === 'retrying' ? new Date(Date.now() + Math.pow(2, attempt) * 1000) : null,
            });
            if (status !== 'delivered') {
                throw new Error(`Webhook dispatch failed with HTTP ${httpStatusCode}: ${errorMsg}`);
            }
        }
    }
};
exports.WebhookDispatchProcessor = WebhookDispatchProcessor;
exports.WebhookDispatchProcessor = WebhookDispatchProcessor = WebhookDispatchProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.QUEUE_WEBHOOK_DISPATCH),
    __param(0, (0, mongoose_1.InjectModel)(webhook_delivery_schema_1.WebhookDelivery.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WebhookDispatchProcessor);
//# sourceMappingURL=webhook-dispatch.processor.js.map