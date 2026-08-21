export interface EncryptedPayload {
    encryptedData: string;
    iv: string;
    tag: string;
}
export declare class EncryptionService {
    private readonly logger;
    private readonly algorithm;
    private readonly masterKey;
    constructor();
    encrypt(plainText: string): EncryptedPayload;
    decrypt(payload: EncryptedPayload): string;
}
