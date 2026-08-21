import { Schema } from 'mongoose';
export interface TenancyPluginOptions {
    requireWorkspace?: boolean;
}
export declare function tenancyPlugin(schema: Schema, options?: TenancyPluginOptions): void;
