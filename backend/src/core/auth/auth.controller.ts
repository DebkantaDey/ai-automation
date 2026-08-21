import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { OAuthService } from './services/oauth/oauth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, RefreshTokenDto } from './dto/login.dto';
import { VerifyEmailDto, ResendVerificationDto } from './dto/verify-email.dto';
import { ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/password.dto';
import { CurrentOrganizationId, CurrentUser, Public } from '../tenancy/tenant.decorators';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken?: string) {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  @Public()
  @Post('register')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new tenant account and root user' })
  @ApiResponse({ status: 201, description: 'User & organization created successfully' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Verify email address with single-use token' })
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ipAddress: string,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.authService.verifyEmail(dto, ipAddress, userAgent);

    if (result.tokens) {
      this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    }
    return result;
  }

  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Resend email verification link' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ipAddress: string,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const result = await this.authService.login(dto, ipAddress, userAgent);

    if (result.tokens) {
      this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    }
    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Ip() ipAddress: string,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.refresh_token;
    const userAgent = req.headers['user-agent'] || '';
    const tokens = await this.authService.refreshToken(refreshToken, ipAddress, userAgent);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return tokens;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke current refresh token session' })
  async logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.refresh_token;
    const result = await this.authService.logout(refreshToken);
    this.clearAuthCookies(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions across all devices for current user' })
  async logoutAll(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logoutAll(userId);
    this.clearAuthCookies(res);
    return result;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Request password reset email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Reset password using single-use reset token' })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.resetPassword(dto);
    this.clearAuthCookies(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.changePassword(userId, dto);
    this.clearAuthCookies(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile, memberships, and workspaces' })
  async getMe(
    @CurrentUser('id') userId: string,
    @CurrentOrganizationId() activeOrgId?: string,
  ) {
    return this.authService.getMe(userId, activeOrgId);
  }

  // OAuth Google Endpoints
  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Initiate Google OAuth login redirect' })
  async googleAuth(@Res() res: Response) {
    const state = Math.random().toString(36).substring(7);
    const url = this.oauthService.getAuthorizationUrl('google', state);
    res.redirect(url);
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  async googleCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ipAddress: string,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const user = await this.oauthService.handleOAuthCallback('google', code, ipAddress, userAgent);
    const tokens = await this.authService.createSession(user, ipAddress, userAgent);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?oauth_success=true`);
  }

  // OAuth Microsoft Endpoints
  @Public()
  @Get('microsoft')
  @ApiOperation({ summary: 'Initiate Microsoft OAuth login redirect' })
  async microsoftAuth(@Res() res: Response) {
    const state = Math.random().toString(36).substring(7);
    const url = this.oauthService.getAuthorizationUrl('microsoft', state);
    res.redirect(url);
  }

  @Public()
  @Get('microsoft/callback')
  @ApiOperation({ summary: 'Handle Microsoft OAuth callback' })
  async microsoftCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
    @Ip() ipAddress: string,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    const user = await this.oauthService.handleOAuthCallback('microsoft', code, ipAddress, userAgent);
    const tokens = await this.authService.createSession(user, ipAddress, userAgent);

    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    const frontendUrl = this.configService.get<string>('app.frontendUrl') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?oauth_success=true`);
  }
}
