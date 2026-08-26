import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { CustomerActivity, CustomerActivityDocument } from '../../crm/schemas/customer-activity.schema';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { EventBusService } from '../../../core/events/event-bus.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(CustomerActivity.name)
    private readonly activityModel: Model<CustomerActivityDocument>,
    private readonly eventBus: EventBusService,
  ) {}

  private toObjectId(id: string | any): Types.ObjectId | any {
    if (typeof id === 'string' && Types.ObjectId.isValid(id)) {
      return new Types.ObjectId(id);
    }
    return id;
  }

  async createTask(
    organizationId: string,
    userId?: string,
    dto?: CreateTaskDto,
    workspaceId?: string,
  ): Promise<TaskDocument> {
    if (!dto) {
      throw new BadRequestException('Task payload is required');
    }

    const task = new this.taskModel({
      ...dto,
      organizationId: this.toObjectId(organizationId),
      workspaceId: workspaceId ? this.toObjectId(workspaceId) : undefined,
      assigneeUserId: dto.assigneeUserId ? this.toObjectId(dto.assigneeUserId) : undefined,
      customerId: dto.customerId ? this.toObjectId(dto.customerId) : undefined,
      leadId: dto.leadId ? this.toObjectId(dto.leadId) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      createdBy: userId ? this.toObjectId(userId) : undefined,
    });

    await task.save();

    if (task.customerId) {
      const act = new this.activityModel({
        organizationId: this.toObjectId(organizationId),
        customerId: task.customerId,
        activityType: 'task',
        title: `Task Created: ${task.title}`,
        description: `Assigned priority: ${task.priority} (${task.status})`,
        source: task.isAiGenerated ? 'ai' : 'human',
        createdBy: userId ? this.toObjectId(userId) : undefined,
      });
      await act.save();
    }

    this.logger.log(`Created task [${task.title}] in Org [${organizationId}]`);

    this.eventBus.emit(
      'tasks.task_created',
      organizationId,
      workspaceId,
      { taskId: task._id, title: task.title, priority: task.priority },
    );

    return task;
  }

  async listTasks(
    organizationId: string,
    query: {
      status?: string;
      priority?: string;
      assigneeUserId?: string;
      customerId?: string;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const filter: any = {
      organizationId: this.toObjectId(organizationId),
      isDeleted: false,
    };

    if (query.status && query.status !== 'all') {
      filter.status = query.status.toLowerCase();
    }
    if (query.priority && query.priority !== 'all') {
      filter.priority = query.priority.toLowerCase();
    }
    if (query.assigneeUserId) {
      filter.assigneeUserId = this.toObjectId(query.assigneeUserId);
    }
    if (query.customerId) {
      filter.customerId = this.toObjectId(query.customerId);
    }
    if (query.search) {
      const regex = new RegExp(query.search, 'i');
      filter.title = regex;
    }

    const [tasks, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assigneeUserId', 'firstName lastName email')
        .populate('customerId', 'name company email phone')
        .populate('leadId', 'name company email phone')
        .exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return {
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(organizationId: string, id: string): Promise<TaskDocument> {
    const task = await this.taskModel
      .findOne({
        _id: this.toObjectId(id),
        organizationId: this.toObjectId(organizationId),
        isDeleted: false,
      })
      .populate('assigneeUserId', 'firstName lastName email')
      .populate('customerId', 'name company email phone')
      .exec();

    if (!task) {
      throw new NotFoundException(`Task with id '${id}' not found`);
    }
    return task;
  }

  async updateTask(
    organizationId: string,
    id: string,
    dto: UpdateTaskDto,
    userId?: string,
  ): Promise<TaskDocument> {
    const task = await this.getTaskById(organizationId, id);

    Object.assign(task, {
      ...dto,
      assigneeUserId: dto.assigneeUserId ? this.toObjectId(dto.assigneeUserId) : task.assigneeUserId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : task.dueDate,
      updatedBy: userId ? this.toObjectId(userId) : undefined,
    });

    await task.save();
    return task;
  }

  async completeTask(
    organizationId: string,
    id: string,
    userId: string,
  ): Promise<TaskDocument> {
    const task = await this.getTaskById(organizationId, id);

    task.status = 'completed';
    task.completedAt = new Date();
    task.completedBy = this.toObjectId(userId);
    task.updatedBy = this.toObjectId(userId);
    await task.save();

    if (task.customerId) {
      const act = new this.activityModel({
        organizationId: this.toObjectId(organizationId),
        customerId: task.customerId,
        activityType: 'task',
        title: `Task Completed: ${task.title}`,
        source: 'human',
        createdBy: this.toObjectId(userId),
      });
      await act.save();
    }

    this.eventBus.emit(
      'tasks.task_completed',
      organizationId,
      task.workspaceId?.toString(),
      { taskId: task._id },
    );

    return task;
  }

  async deleteTask(organizationId: string, id: string, userId?: string): Promise<boolean> {
    const task = await this.getTaskById(organizationId, id);
    task.isDeleted = true;
    task.deletedAt = new Date();
    task.updatedBy = userId ? this.toObjectId(userId) : undefined;
    await task.save();
    return true;
  }
}
