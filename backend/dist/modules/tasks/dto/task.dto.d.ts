import { TaskStatus, TaskPriority } from '../schemas/task.schema';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    assigneeUserId?: string;
    customerId?: string;
    leadId?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    isAiGenerated?: boolean;
    source?: string;
    tags?: string[];
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    assigneeUserId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string;
}
