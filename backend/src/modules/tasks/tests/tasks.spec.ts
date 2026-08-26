import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TasksService } from '../services/tasks.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { Task } from '../schemas/task.schema';
import { CustomerActivity } from '../../crm/schemas/customer-activity.schema';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskModel: any;
  let mockActivityModel: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockTaskModel = jest.fn().mockImplementation(function (data) {
      this._id = 'task-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockTaskModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        { _id: 'task-1', title: 'Prepare Proposal', status: 'todo', priority: 'high' },
      ]),
    });
    mockTaskModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockTaskModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({
        _id: 'task-123',
        title: 'Prepare Proposal',
        status: 'todo',
        isDeleted: false,
        save: jest.fn().mockResolvedValue(true),
      }),
    });

    mockActivityModel = jest.fn().mockImplementation(function (data) {
      this._id = 'act-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });

    mockEventBus = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task.name), useValue: mockTaskModel },
        { provide: getModelToken(CustomerActivity.name), useValue: mockActivityModel },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should create a task and emit task_created event', async () => {
    const task = await service.createTask('org-1', 'user-1', {
      title: 'Prepare Custom Proposal Document for Global Logistics',
      priority: 'high',
      status: 'todo',
    });

    expect(task).toBeDefined();
    expect(task.title).toContain('Global Logistics');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'tasks.task_created',
      'org-1',
      undefined,
      expect.objectContaining({ taskId: 'task-123' }),
    );
  });

  it('should complete task and mark completed status', async () => {
    const task = await service.completeTask('org-1', 'task-123', 'user-1');
    expect(task.status).toBe('completed');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'tasks.task_completed',
      'org-1',
      undefined,
      expect.objectContaining({ taskId: 'task-123' }),
    );
  });
});
