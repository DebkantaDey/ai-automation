import { Document, Types } from 'mongoose';
export type PrivacyConsentDocument = PrivacyConsent & Document;
export declare class PrivacyConsent {
    userId: Types.ObjectId;
    organizationId?: Types.ObjectId;
    analyticsConsent: boolean;
    marketingConsent: boolean;
    dataProcessingConsent: boolean;
    ipAddress?: string;
    consentTimestamp: Date;
}
export declare const PrivacyConsentSchema: import("mongoose").Schema<PrivacyConsent, import("mongoose").Model<PrivacyConsent, any, any, any, Document<unknown, any, PrivacyConsent, any, {}> & PrivacyConsent & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PrivacyConsent, Document<unknown, {}, import("mongoose").FlatRecord<PrivacyConsent>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PrivacyConsent> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
