import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '../../core/tenancy/tenant.decorators';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongooseIndicator: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check system health and database connectivity' })
  check() {
    return this.health.check([
      () => this.mongooseIndicator.pingCheck('mongodb'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  @Public()
  @Get('liveness')
  @ApiOperation({ summary: 'Kubernetes/Docker liveness probe' })
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Public()
  @Get('readiness')
  @HealthCheck()
  @ApiOperation({ summary: 'Kubernetes/Docker readiness probe' })
  readiness() {
    return this.health.check([
      () => this.mongooseIndicator.pingCheck('mongodb'),
    ]);
  }
}
