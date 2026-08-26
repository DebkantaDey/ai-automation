import { Document, Schema as MongooseSchema, Types } from 'mongoose';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskDocument = Task & Document;
export declare class Task {
    organizationId: Types.ObjectId;
    workspaceId?: Types.ObjectId;
    title: string;
    description?: string;
    assigneeUserId?: Types.ObjectId;
    customerId?: Types.ObjectId;
    leadId?: Types.ObjectId;
    workflowId?: Types.ObjectId;
    executionId?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: Date;
    isAiGenerated: boolean;
    source?: string;
    completedAt?: Date;
    completedBy?: Types.ObjectId;
    tags: string[];
    isDeleted: boolean;
    deletedAt?: Date;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TaskSchema: MongooseSchema<Task, import("mongoose").Model<Task, any, any, any, Document<unknown, any, Task, any, {}> & Task & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Task, Document<unknown, {}, import("mongoose").FlatRecord<Task>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Task> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
