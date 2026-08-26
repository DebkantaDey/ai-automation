import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { Availability, AvailabilitySchema } from './schemas/availability.schema';
import { Customer, CustomerSchema } from '../crm/schemas/customer.schema';
import { CustomerActivity, CustomerActivitySchema } from '../crm/schemas/customer-activity.schema';
import { AppointmentsService } from './services/appointments.service';
import { AppointmentsController } from './controllers/appointments.controller';
import { EventsModule } from '../../core/events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: Availability.name, schema: AvailabilitySchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerActivity.name, schema: CustomerActivitySchema },
    ]),
    EventsModule,
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class CalendarModule {}
