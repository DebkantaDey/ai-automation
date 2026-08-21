import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  bcryptRounds: number;
  googleClientId?: string;
  googleClientSecret?: string;
  googleCallbackUrl?: string;
  microsoftClientId?: string;
  microsoftClientSecret?: string;
  microsoftCallbackUrl?: string;
}

export default registerAs('auth', (): AuthConfig => ({
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-access-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-change-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  microsoftClientId: process.env.MICROSOFT_CLIENT_ID,
  microsoftClientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  microsoftCallbackUrl: process.env.MICROSOFT_CALLBACK_URL,
}));
