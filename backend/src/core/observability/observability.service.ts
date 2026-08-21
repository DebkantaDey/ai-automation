import { Injectable, Logger } from '@nestjs/common';

export interface TraceSpan {
  name: string;
  startTime: number;
  tags: Record<string, any>;
}

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger('Telemetry');

  startSpan(name: string, tags: Record<string, any> = {}): TraceSpan {
    return {
      name,
      startTime: Date.now(),
      tags,
    };
  }

  endSpan(span: TraceSpan, extraTags: Record<string, any> = {}): number {
    const durationMs = Date.now() - span.startTime;
    const combinedTags = { ...span.tags, ...extraTags, durationMs };

    this.logger.debug(
      `[Span: ${span.name}] Completed in ${durationMs}ms - Tags: ${JSON.stringify(combinedTags)}`,
    );
    return durationMs;
  }

  recordAiMetric(provider: string, model: string, durationMs: number, tokens: number) {
    this.logger.log(
      `[AI Metric] Provider: ${provider} | Model: ${model} | Latency: ${durationMs}ms | Tokens: ${tokens}`,
    );
  }

  recordQueueFailure(queueName: string, jobId: string, error: string) {
    this.logger.error(
      `[Queue Failure] Queue: ${queueName} | JobId: ${jobId} | Error: ${error}`,
    );
  }

  recordExternalApiLatency(serviceName: string, method: string, durationMs: number, statusCode: number) {
    this.logger.log(
      `[External API] Service: ${serviceName} | Method: ${method} | Status: ${statusCode} | Latency: ${durationMs}ms`,
    );
  }
}
