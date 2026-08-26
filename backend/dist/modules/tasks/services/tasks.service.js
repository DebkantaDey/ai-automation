"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const task_schema_1 = require("../schemas/task.schema");
const customer_activity_schema_1 = require("../../crm/schemas/customer-activity.schema");
const event_bus_service_1 = require("../../../core/events/event-bus.service");
let TasksService = TasksService_1 = class TasksService {
    taskModel;
    activityModel;
    eventBus;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(taskModel, activityModel, eventBus) {
        this.taskModel = taskModel;
        this.activityModel = activityModel;
        this.eventBus = eventBus;
    }
    toObjectId(id) {
        if (typeof id === 'string' && mongoose_2.Types.ObjectId.isValid(id)) {
            return new mongoose_2.Types.ObjectId(id);
        }
        return id;
    }
    async createTask(organizationId, userId, dto, workspaceId) {
        if (!dto) {
            throw new common_1.BadRequestException('Task payload is required');
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
        this.eventBus.emit('tasks.task_created', organizationId, workspaceId, { taskId: task._id, title: task.title, priority: task.priority });
        return task;
    }
    async listTasks(organizationId, query = {}) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const filter = {
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
    async getTaskById(organizationId, id) {
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
            throw new common_1.NotFoundException(`Task with id '${id}' not found`);
        }
        return task;
    }
    async updateTask(organizationId, id, dto, userId) {
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
    async completeTask(organizationId, id, userId) {
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
        this.eventBus.emit('tasks.task_completed', organizationId, task.workspaceId?.toString(), { taskId: task._id });
        return task;
    }
    async deleteTask(organizationId, id, userId) {
        const task = await this.getTaskById(organizationId, id);
        task.isDeleted = true;
        task.deletedAt = new Date();
        task.updatedBy = userId ? this.toObjectId(userId) : undefined;
        await task.save();
        return true;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(task_schema_1.Task.name)),
    __param(1, (0, mongoose_1.InjectModel)(customer_activity_schema_1.CustomerActivity.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        event_bus_service_1.EventBusService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map