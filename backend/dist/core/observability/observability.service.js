"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityService = void 0;
const common_1 = require("@nestjs/common");
let ObservabilityService = class ObservabilityService {
    logger = new common_1.Logger('Telemetry');
    startSpan(name, tags = {}) {
        return {
            name,
            startTime: Date.now(),
            tags,
        };
    }
    endSpan(span, extraTags = {}) {
        const durationMs = Date.now() - span.startTime;
        const combinedTags = { ...span.tags, ...extraTags, durationMs };
        this.logger.debug(`[Span: ${span.name}] Completed in ${durationMs}ms - Tags: ${JSON.stringify(combinedTags)}`);
        return durationMs;
    }
    recordAiMetric(provider, model, durationMs, tokens) {
        this.logger.log(`[AI Metric] Provider: ${provider} | Model: ${model} | Latency: ${durationMs}ms | Tokens: ${tokens}`);
    }
    recordQueueFailure(queueName, jobId, error) {
        this.logger.error(`[Queue Failure] Queue: ${queueName} | JobId: ${jobId} | Error: ${error}`);
    }
    recordExternalApiLatency(serviceName, method, durationMs, statusCode) {
        this.logger.log(`[External API] Service: ${serviceName} | Method: ${method} | Status: ${statusCode} | Latency: ${durationMs}ms`);
    }
};
exports.ObservabilityService = ObservabilityService;
exports.ObservabilityService = ObservabilityService = __decorate([
    (0, common_1.Injectable)()
], ObservabilityService);
//# sourceMappingURL=observability.service.js.map