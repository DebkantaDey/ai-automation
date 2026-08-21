export interface AppConfig {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    corsOrigins: string[];
    frontendUrl: string;
}
declare const _default: (() => AppConfig) & import("@nestjs/config").ConfigFactoryKeyHost<AppConfig>;
export default _default;
