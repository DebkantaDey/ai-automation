import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type KnowledgeBaseDocument = KnowledgeBase & Document;
export declare class KnowledgeBase {
    organizationId: Types.ObjectId;
    workspaceId: Types.ObjectId;
    name: string;
    description: string;
    documentsCount: number;
    totalChunks: number;
    embeddingModel: string;
    status: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const KnowledgeBaseSchema: MongooseSchema<KnowledgeBase, import("mongoose").Model<KnowledgeBase, any, any, any, Document<unknown, any, KnowledgeBase, any, {}> & KnowledgeBase & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, KnowledgeBase, Document<unknown, {}, import("mongoose").FlatRecord<KnowledgeBase>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<KnowledgeBase> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
