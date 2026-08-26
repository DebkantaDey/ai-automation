import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/task.schema';
import { Customer, CustomerSchema } from '../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivitySchema } from '../crm/schemas/customer-activity.schema';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { EventsModule } from '../../core/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerActivity.name, schema: CustomerActivitySchema },
    ]),
    EventsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
