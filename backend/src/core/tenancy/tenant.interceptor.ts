import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { TenantContextService } from './tenant-context.service';
import { TenantContext } from './tenant-context.interface';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest();

      const organizationId =
        request.headers['x-organization-id'] ||
        request.user?.organizationId ||
        request.params?.organizationId ||
        request.query?.organizationId;

      const workspaceId =
        request.headers['x-workspace-id'] ||
        request.user?.workspaceId ||
        request.params?.workspaceId ||
        request.query?.workspaceId;

      const correlationId = request.headers['x-correlation-id'] || uuidv4();

      const tenantContext: TenantContext = {
        userId: request.user?.id || request.user?._id?.toString(),
        userEmail: request.user?.email,
        organizationId: organizationId ? String(organizationId) : undefined,
        workspaceId: workspaceId ? String(workspaceId) : undefined,
        role: request.user?.role,
        permissions: request.user?.permissions,
        correlationId: String(correlationId),
      };

      // Set correlation ID in response header
      const response = context.switchToHttp().getResponse();
      if (response && typeof response.setHeader === 'function') {
        response.setHeader('x-correlation-id', correlationId);
      }

      return new Observable((subscriber) => {
        TenantContextService.run(tenantContext, () => {
          next.handle().subscribe({
            next: (val) => subscriber.next(val),
            error: (err) => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        });
      });
    }

    return next.handle();
  }
}
