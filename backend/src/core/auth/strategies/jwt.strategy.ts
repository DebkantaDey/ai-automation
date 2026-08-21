import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthConfig } from '../../config/auth.config';

export interface JwtPayload {
  sub: string;
  email: string;
  systemRole: string;
  organizationId?: string;
  workspaceId?: string;
  role?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const authConfig = configService.get<AuthConfig>('auth');
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['access_token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig?.jwtSecret || 'super-secret-jwt-access-key',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return {
      id: payload.sub,
      _id: payload.sub,
      email: payload.email,
      systemRole: payload.systemRole,
      organizationId: payload.organizationId,
      workspaceId: payload.workspaceId,
      role: payload.role,
    };
  }
}
