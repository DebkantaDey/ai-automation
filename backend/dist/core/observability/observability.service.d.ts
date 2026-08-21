export interface TraceSpan {
    name: string;
    startTime: number;
    tags: Record<string, any>;
}
export declare class ObservabilityService {
    private readonly logger;
    startSpan(name: string, tags?: Record<string, any>): TraceSpan;
    endSpan(span: TraceSpan, extraTags?: Record<string, any>): number;
    recordAiMetric(provider: string, model: string, durationMs: number, tokens: number): void;
    recordQueueFailure(queueName: string, jobId: string, error: string): void;
    recordExternalApiLatency(serviceName: string, method: string, durationMs: number, statusCode: number): void;
}
