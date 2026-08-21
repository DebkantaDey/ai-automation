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
declare const _default: (() => AuthConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AuthConfig>;
export default _default;
