import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { OrganizationMemberDocument } from '../../modules/organizations/schemas/organization-member.schema';
export declare class TenantGuard implements CanActivate {
    private readonly reflector;
    private readonly memberModel;
    constructor(reflector: Reflector, memberModel: Model<OrganizationMemberDocument>);
    private toObjectId;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
