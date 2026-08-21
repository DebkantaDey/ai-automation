import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import { Organization, OrganizationSchema } from '../../modules/organizations/schemas/organization.schema';
import { OrganizationMember, OrganizationMemberSchema } from '../../modules/organizations/schemas/organization-member.schema';
import { Workspace, WorkspaceSchema } from '../../modules/workspaces/schemas/workspace.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { AuthToken, AuthTokenSchema } from './schemas/auth-token.schema';
import { EmailService } from './services/email/email.service';
import { ConsoleEmailProvider } from './services/email/providers/console-email.provider';
import { SmtpEmailProvider } from './services/email/providers/smtp-email.provider';
import { OAuthService } from './services/oauth/oauth.service';
import { GoogleOAuthProvider } from './services/oauth/providers/google-oauth.provider';
import { MicrosoftOAuthProvider } from './services/oauth/providers/microsoft-oauth.provider';
import { AuthConfig } from '../config/auth.config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const authConfig = configService.get<AuthConfig>('auth');
        return {
          secret: authConfig?.jwtSecret || 'super-secret-jwt-access-key',
          signOptions: {
            expiresIn: authConfig?.jwtExpiresIn || '15m',
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Organization.name, schema: OrganizationSchema },
      { name: OrganizationMember.name, schema: OrganizationMemberSchema },
      { name: Workspace.name, schema: WorkspaceSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: AuthToken.name, schema: AuthTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    EmailService,
    ConsoleEmailProvider,
    SmtpEmailProvider,
    OAuthService,
    GoogleOAuthProvider,
    MicrosoftOAuthProvider,
  ],
  exports: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    EmailService,
    OAuthService,
    JwtModule,
  ],
})
export class AuthModule {}
