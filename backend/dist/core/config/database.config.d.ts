export interface DatabaseConfig {
    uri: string;
    autoIndex: boolean;
    maxPoolSize: number;
    serverSelectionTimeoutMS: number;
}
declare const _default: (() => DatabaseConfig) & import("@nestjs/config").ConfigFactoryKeyHost<DatabaseConfig>;
export default _default;
