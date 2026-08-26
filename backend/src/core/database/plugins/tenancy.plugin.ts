import { Schema, Document, Query, Aggregate } from 'mongoose';
import { TenantContextService } from '../../tenancy/tenant-context.service';

export interface TenancyPluginOptions {
  requireWorkspace?: boolean;
}

export function tenancyPlugin(schema: Schema, options: TenancyPluginOptions = {}) {
  // If the schema does NOT define organizationId, it is a global or embedded entity (e.g. Plan, User, Organization, subdocuments).
  // Do not inject required organizationId and do not attach tenant scoping hooks.
  if (!schema.path('organizationId')) {
    return;
  }

  // Pre-find hooks: automatically scope queries to the active tenant
  const queryMethods = [
    'countDocuments',
    'find',
    'findOne',
    'findOneAndDelete',
    'findOneAndReplace',
    'findOneAndUpdate',
    'updateMany',
    'updateOne',
    'deleteMany',
    'deleteOne',
  ] as const;

  queryMethods.forEach((method) => {
    schema.pre(method, function (this: Query<any, Document>) {
      const queryOptions = this.getOptions();
      if (queryOptions && queryOptions.skipTenantFilter) {
        return;
      }

      const orgId = TenantContextService.getOrganizationId();
      if (orgId) {
        this.where({ organizationId: orgId });
      }

      if ((options.requireWorkspace || schema.path('workspaceId')) && TenantContextService.getWorkspaceId()) {
        const wsId = TenantContextService.getWorkspaceId();
        if (wsId) {
          this.where({ workspaceId: wsId });
        }
      }
    });
  });

  // Aggregation pipeline scoping
  schema.pre('aggregate', function (this: Aggregate<any>) {
    const pipeline = this.pipeline() as any[];
    const orgId = TenantContextService.getOrganizationId();

    if (orgId) {
      const matchStage = pipeline.find((stage: any) => stage.$match);
      if (matchStage && matchStage.$match) {
        if (!matchStage.$match.organizationId) {
          matchStage.$match.organizationId = orgId;
        }
      } else {
        pipeline.unshift({ $match: { organizationId: orgId } });
      }
    }
  });
}
