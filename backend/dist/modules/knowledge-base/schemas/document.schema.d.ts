import { Document as MongoDoc, Schema as MongooseSchema, Types } from 'mongoose';
export type DocumentDocument = Document & MongoDoc;
export declare class Document {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    knowledgeBaseId: Types.ObjectId;
    name: string;
    mimeType: string;
    sizeBytes: number;
    fileUrl?: string;
    rawText?: string;
    chunksCount: number;
    status: string;
    error?: string;
    uploadedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DocumentSchema: MongooseSchema<Document, import("mongoose").Model<Document, any, any, any, MongoDoc<unknown, any, Document, any, {}> & Document & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Document, MongoDoc<unknown, {}, import("mongoose").FlatRecord<Document>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Document> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
