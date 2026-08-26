import { TasksService } from '../services/tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    createTask(orgId: string, wsId: string, userId: string, dto: CreateTaskDto): Promise<import("../schemas/task.schema").TaskDocument>;
    listTasks(orgId: string, status?: string, priority?: string, assigneeUserId?: string, customerId?: string, search?: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, import("../schemas/task.schema").TaskDocument, {}, {}> & import("../schemas/task.schema").Task & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTaskById(orgId: string, id: string): Promise<import("../schemas/task.schema").TaskDocument>;
    updateTask(orgId: string, userId: string, id: string, dto: UpdateTaskDto): Promise<import("../schemas/task.schema").TaskDocument>;
    completeTask(orgId: string, userId: string, id: string): Promise<import("../schemas/task.schema").TaskDocument>;
    deleteTask(orgId: string, userId: string, id: string): Promise<boolean>;
}
