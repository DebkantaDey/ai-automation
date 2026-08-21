import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisConfig } from '../config/redis.config';
import {
  QUEUE_WORKFLOW_EXECUTION,
  QUEUE_AI_TASKS,
  QUEUE_WEBHOOK_DISPATCH,
  QUEUE_EMAIL_DISPATCH,
  QUEUE_NOTIFICATIONS,
  QUEUE_INTEGRATION_TASKS,
  QUEUE_FILE_PROCESSING,
  QUEUE_BILLING_EVENTS,
  QUEUE_AUDIT_LOGS,
} from './queue.constants';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get<RedisConfig>('redis');
        return {
          connection: {
            host: redisConfig?.host || 'localhost',
            port: redisConfig?.port || 6379,
            password: redisConfig?.password,
            db: redisConfig?.db || 0,
            tls: redisConfig?.tlsEnabled ? {} : undefined,
          },
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 1000,
            removeOnFail: 5000,
          },
        };
      },
    }),
    BullModule.registerQueue(
      { name: QUEUE_WORKFLOW_EXECUTION },
      { name: QUEUE_AI_TASKS },
      { name: QUEUE_WEBHOOK_DISPATCH },
      { name: QUEUE_EMAIL_DISPATCH },
      { name: QUEUE_NOTIFICATIONS },
      { name: QUEUE_INTEGRATION_TASKS },
      { name: QUEUE_FILE_PROCESSING },
      { name: QUEUE_BILLING_EVENTS },
      { name: QUEUE_AUDIT_LOGS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
