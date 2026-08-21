import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';
import { TenantContextService } from '../../tenancy/tenant-context.service';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const statusCode = response.statusCode || 200;
    const tenantCtx = TenantContextService.getContext();

    return next.handle().pipe(
      map((result) => {
        // If result already formatted as ApiResponse, preserve
        if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
          return result;
        }

        // Handle paginated responses
        if (result && typeof result === 'object' && 'data' in result && 'total' in result) {
          return {
            success: true,
            statusCode,
            data: result.data,
            meta: {
              total: result.total,
              page: result.page,
              limit: result.limit,
              totalPages: result.totalPages,
              correlationId: tenantCtx?.correlationId,
              timestamp: new Date().toISOString(),
            },
          };
        }

        return {
          success: true,
          statusCode,
          data: result,
          meta: {
            correlationId: tenantCtx?.correlationId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
