import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: string;
    email: string;
    systemRole: string;
    organizationId?: string;
    workspaceId?: string;
    role?: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        _id: string;
        email: string;
        systemRole: string;
        organizationId: string;
        workspaceId: string;
        role: string;
    }>;
}
export {};
