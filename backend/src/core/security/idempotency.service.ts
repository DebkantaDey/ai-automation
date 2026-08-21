import { Injectable, Logger } from '@nestjs/common';

export interface IdempotencyRecord {
  status: 'in_progress' | 'completed';
  statusCode?: number;
  body?: any;
  createdAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly records = new Map<string, IdempotencyRecord>();

  async getRecord(key: string): Promise<IdempotencyRecord | null> {
    return this.records.get(key) || null;
  }

  async markInProgress(key: string, ttlSeconds = 300): Promise<boolean> {
    const existing = this.records.get(key);
    if (existing) {
      return false; // Key already exists
    }

    this.records.set(key, {
      status: 'in_progress',
      createdAt: Date.now(),
    });

    // Cleanup after TTL
    setTimeout(() => this.records.delete(key), ttlSeconds * 1000);
    return true;
  }

  async saveResponse(key: string, statusCode: number, body: any): Promise<void> {
    this.records.set(key, {
      status: 'completed',
      statusCode,
      body,
      createdAt: Date.now(),
    });
  }

  async clearKey(key: string): Promise<void> {
    this.records.delete(key);
  }
}
