"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const worker_module_1 = require("./worker/worker.module");
async function bootstrapWorker() {
    const logger = new common_1.Logger('WorkerBootstrap');
    logger.log('Initializing AI Business Automation background worker context...');
    const app = await core_1.NestFactory.createApplicationContext(worker_module_1.WorkerModule);
    app.enableShutdownHooks();
    logger.log('Dedicated background queue workers are active and listening for jobs');
}
bootstrapWorker().catch((err) => {
    console.error('Failed to bootstrap worker:', err);
    process.exit(1);
});
//# sourceMappingURL=worker.js.map