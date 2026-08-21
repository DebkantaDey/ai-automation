import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as crypto from 'crypto';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'apikey',
  'cardnumber',
  'cvv',
  'clientsecret',
  'webhooksecret',
]);

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  private sanitize(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitize(item));

    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const lower = k.toLowerCase().replace(/[-_]/g, '');
      if (SENSITIVE_KEYS.has(lower)) {
        clean[k] = '[REDACTED]';
      } else if (typeof v === 'object') {
        clean[k] = this.sanitize(v);
      } else {
        clean[k] = v;
      }
    }
    return clean;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const requestId = request.headers['x-request-id'] || `req_${crypto.randomBytes(8).toString('hex')}`;
    request.requestId = requestId;
    response.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();
    const { method, originalUrl, tenant } = request;

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;
          const tenantInfo = tenant ? `[Org: ${tenant.organizationId}] ` : '';

          this.logger.log(
            `[${requestId}] ${tenantInfo}${method} ${originalUrl} ${statusCode} +${duration}ms`,
          );
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const tenantInfo = tenant ? `[Org: ${tenant.organizationId}] ` : '';

          this.logger.warn(
            `[${requestId}] ${tenantInfo}${method} ${originalUrl} ERR [${err.message}] +${duration}ms`,
          );
        },
      }),
    );
  }
}
