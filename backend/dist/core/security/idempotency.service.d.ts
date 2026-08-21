export interface IdempotencyRecord {
    status: 'in_progress' | 'completed';
    statusCode?: number;
    body?: any;
    createdAt: number;
}
export declare class IdempotencyService {
    private readonly logger;
    private readonly records;
    getRecord(key: string): Promise<IdempotencyRecord | null>;
    markInProgress(key: string, ttlSeconds?: number): Promise<boolean>;
    saveResponse(key: string, statusCode: number, body: any): Promise<void>;
    clearKey(key: string): Promise<void>;
}
