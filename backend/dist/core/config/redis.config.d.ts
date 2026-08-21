export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
    tlsEnabled: boolean;
}
declare const _default: (() => RedisConfig) & import("@nestjs/config").ConfigFactoryKeyHost<RedisConfig>;
export default _default;
