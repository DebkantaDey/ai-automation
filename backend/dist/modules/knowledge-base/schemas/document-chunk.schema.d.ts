import { Document as MongoDoc, Schema as MongooseSchema, Types } from 'mongoose';
export type DocumentChunkDocument = DocumentChunk & MongoDoc;
export declare class DocumentChunk {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    knowledgeBaseId: Types.ObjectId;
    documentId: Types.ObjectId;
    chunkIndex: number;
    text: string;
    embedding: number[];
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DocumentChunkSchema: MongooseSchema<DocumentChunk, import("mongoose").Model<DocumentChunk, any, any, any, MongoDoc<unknown, any, DocumentChunk, any, {}> & DocumentChunk & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DocumentChunk, MongoDoc<unknown, {}, import("mongoose").FlatRecord<DocumentChunk>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<DocumentChunk> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
