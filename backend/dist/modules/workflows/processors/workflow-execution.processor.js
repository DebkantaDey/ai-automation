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
var WorkflowExecutionProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowExecutionProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const queue_constants_1 = require("../../../core/queue/queue.constants");
const workflow_engine_service_1 = require("../engine/workflow-engine.service");
let WorkflowExecutionProcessor = WorkflowExecutionProcessor_1 = class WorkflowExecutionProcessor extends bullmq_1.WorkerHost {
    workflowEngine;
    logger = new common_1.Logger(WorkflowExecutionProcessor_1.name);
    constructor(workflowEngine) {
        super();
        this.workflowEngine = workflowEngine;
    }
    async process(job) {
        if (job.name === queue_constants_1.JOB_EXECUTE_WORKFLOW) {
            const { executionId, nodes, edges, initialPayload } = job.data;
            this.logger.log(`Processing workflow execution job [${job.id}] for execution [${executionId}]`);
            return this.workflowEngine.runWorkflow(executionId, nodes, edges, initialPayload || {});
        }
        this.logger.warn(`Unknown workflow job name: [${job.name}]`);
    }
};
exports.WorkflowExecutionProcessor = WorkflowExecutionProcessor;
exports.WorkflowExecutionProcessor = WorkflowExecutionProcessor = WorkflowExecutionProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queue_constants_1.QUEUE_WORKFLOW_EXECUTION),
    __metadata("design:paramtypes", [workflow_engine_service_1.WorkflowEngineService])
], WorkflowExecutionProcessor);
//# sourceMappingURL=workflow-execution.processor.js.map