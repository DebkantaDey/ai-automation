import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../api-keys.service';

export const SCOPES_KEY = 'required_scopes';
export const RequireScopes = (...scopes: string[]) => {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    if (descriptor) {
      Reflect.defineMetadata(SCOPES_KEY, scopes, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(SCOPES_KEY, scopes, target);
    return target;
  };
};

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeysService: ApiKeysService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Extract API key from header 'x-api-key' or 'Authorization: Bearer ak_live_...'
    let rawKey: string | undefined = request.headers['x-api-key'];

    if (!rawKey && request.headers.authorization) {
      const authHeader = request.headers.authorization;
      if (authHeader.startsWith('Bearer ak_live_')) {
        rawKey = authHeader.substring(7);
      }
    }

    if (!rawKey) {
      throw new UnauthorizedException('Missing X-API-Key or Bearer token header');
    }

    const apiKey = await this.apiKeysService.validateKey(rawKey);

    // Attach tenant and API key user context to request
    request.tenant = {
      organizationId: apiKey.organizationId.toString(),
      workspaceId: apiKey.workspaceId.toString(),
    };

    request.user = {
      id: apiKey.createdBy?.toString() || 'api-key-client',
      organizationId: apiKey.organizationId.toString(),
      workspaceId: apiKey.workspaceId.toString(),
      isApiKey: true,
      apiKeyId: apiKey._id.toString(),
      scopes: apiKey.scopes,
    };

    // Verify required scopes
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(SCOPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredScopes && requiredScopes.length > 0) {
      const hasWildcard = apiKey.scopes.includes('*');
      const hasAllScopes = requiredScopes.every((scope) => apiKey.scopes.includes(scope));

      if (!hasWildcard && !hasAllScopes) {
        throw new ForbiddenException(`API Key lacks required scopes: [${requiredScopes.join(', ')}]`);
      }
    }

    return true;
  }
}
