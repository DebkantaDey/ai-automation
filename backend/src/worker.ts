import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker/worker.module';

async function bootstrapWorker() {
  const logger = new Logger('WorkerBootstrap');
  logger.log('Initializing AI Business Automation background worker context...');

  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();

  logger.log('Dedicated background queue workers are active and listening for jobs');
}

bootstrapWorker().catch((err) => {
  console.error('Failed to bootstrap worker:', err);
  process.exit(1);
});
