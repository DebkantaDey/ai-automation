export interface StorageConfig {
    provider: 's3' | 'r2' | 'local';
    endpoint?: string;
    region: string;
    bucket: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    publicUrlPrefix?: string;
    signedUrlExpiresIn: number;
}
declare const _default: (() => StorageConfig) & import("@nestjs/config").ConfigFactoryKeyHost<StorageConfig>;
export default _default;
