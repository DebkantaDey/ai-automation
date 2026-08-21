import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiKeysService } from '../api-keys.service';
export declare const SCOPES_KEY = "required_scopes";
export declare const RequireScopes: (...scopes: string[]) => (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => any;
export declare class ApiKeyAuthGuard implements CanActivate {
    private readonly apiKeysService;
    private readonly reflector;
    constructor(apiKeysService: ApiKeysService, reflector: Reflector);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
