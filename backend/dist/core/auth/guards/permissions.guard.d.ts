import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model } from 'mongoose';
import { RolesService } from '../../../modules/roles/roles.service';
import { OrganizationMemberDocument } from '../../../modules/organizations/schemas/organization-member.schema';
export declare class PermissionsGuard implements CanActivate {
    private readonly reflector;
    private readonly rolesService;
    private readonly memberModel;
    constructor(reflector: Reflector, rolesService: RolesService, memberModel: Model<OrganizationMemberDocument>);
    private toObjectId;
    canActivate(context: ExecutionContext): Promise<boolean>;
}
