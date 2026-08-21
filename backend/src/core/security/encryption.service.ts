import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  tag: string;
}

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly masterKey: Buffer;

  constructor() {
    const rawKey = process.env.ENCRYPTION_KEY || 'default-super-secret-key-32-chars-long!';
    this.masterKey = crypto.createHash('sha256').update(rawKey).digest();
  }

  encrypt(plainText: string): EncryptedPayload {
    if (!plainText) {
      return { encryptedData: '', iv: '', tag: '' };
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encryptedData: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  decrypt(payload: EncryptedPayload): string {
    if (!payload || !payload.encryptedData) {
      return '';
    }

    try {
      const iv = Buffer.from(payload.iv, 'hex');
      const tag = Buffer.from(payload.tag, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
      decipher.setAuthTag(tag);

      let decrypted = decipher.update(payload.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      this.logger.error(`Decryption failed: ${err.message}`);
      throw new Error('Failed to decrypt credential payload. Key or authentication tag mismatch.');
    }
  }
}
