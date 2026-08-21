import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { TenantContextService } from './tenant-context.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const REQUIRE_TENANT_KEY = 'requireTenant';
export const RequireTenant = () => SetMetadata(REQUIRE_TENANT_KEY, true);

export const REQUIRE_WORKSPACE_KEY = 'requireWorkspace';
export const RequireWorkspace = () => SetMetadata(REQUIRE_WORKSPACE_KEY, true);

export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  const user = req.user;
  if (!user) {
    const context = TenantContextService.getContext();
    return data ? (context as any)?.[data] : context?.userId;
  }
  return data ? user?.[data] : user;
});

export const CurrentOrganizationId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers['x-organization-id'] || req.user?.organizationId || TenantContextService.getOrganizationId();
});

export const CurrentWorkspaceId = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.headers['x-workspace-id'] || req.user?.workspaceId || TenantContextService.getWorkspaceId();
});

export const CurrentTenant = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  return TenantContextService.getContext();
});
