import { HealthCheckService, MongooseHealthIndicator, MemoryHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private mongooseIndicator;
    private memory;
    constructor(health: HealthCheckService, mongooseIndicator: MongooseHealthIndicator, memory: MemoryHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
    liveness(): {
        status: string;
        timestamp: string;
    };
    readiness(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
