import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { EventBusService } from '../../../core/events/event-bus.service';
export declare class TasksService {
    private readonly taskModel;
    private readonly activityModel;
    private readonly eventBus;
    private readonly logger;
    constructor(taskModel: Model<TaskDocument>, activityModel: Model<CustomerActivityDocument>, eventBus: EventBusService);
    private toObjectId;
    createTask(organizationId: string, userId?: string, dto?: CreateTaskDto, workspaceId?: string): Promise<TaskDocument>;
    listTasks(organizationId: string, query?: {
        status?: string;
        priority?: string;
        assigneeUserId?: string;
        customerId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, TaskDocument, {}, {}> & Task & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    getTaskById(organizationId: string, id: string): Promise<TaskDocument>;
    updateTask(organizationId: string, id: string, dto: UpdateTaskDto, userId?: string): Promise<TaskDocument>;
    completeTask(organizationId: string, id: string, userId: string): Promise<TaskDocument>;
    deleteTask(organizationId: string, id: string, userId?: string): Promise<boolean>;
}
