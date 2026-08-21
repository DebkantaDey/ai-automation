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
var AiTaskProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiTaskProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queue_constants_1 = require("../../core/queue/queue.constants");
const ai_gateway_service_1 = require("../../integrations/ai/ai-gateway.service");
let AiTaskProcessor = AiTaskProcessor_1 = class AiTaskProcessor extends bullmq_1.WorkerHost {
    aiGateway;
    logger = new common_1.Logger(AiTaskProcessor_1.name);
    constructor(aiGateway) {
        super();
        this.aiGateway = aiGateway;
    }
    async process(job) {
        if (job.name !== queue_constants_1.JOB_PROCESS_AI_TASK) {
            return;
        }
        const { prompt, messages, options } = job.data;
        this.logger.log(`Processing asynchronous AI background task [${job.id}]`);
        if (messages && Array.isArray(messages)) {
            return this.aiGateway.generateChat(messages, options);
        }
        return this.aiGateway.generateCompletion(prompt, options);
    }
};
exports.AiTaskProcessor = AiTaskProcessor;
exports.AiTaskProcessor = AiTaskProcessor = AiTaskProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.QUEUE_AI_TASKS),
    __metadata("design:paramtypes", [ai_gateway_service_1.AiGatewayService])
], AiTaskProcessor);
//# sourceMappingURL=ai-task.processor.js.map