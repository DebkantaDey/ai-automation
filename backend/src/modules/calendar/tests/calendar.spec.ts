import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AppointmentsService } from '../services/appointments.service';
import { EventBusService } from '../../../core/events/event-bus.service';
import { Appointment } from '../schemas/appointment.schema';
import { Availability } from '../schemas/availability.schema';
import { Customer } from '../../crm/schemas/customer.schema';
import { CustomerActivity } from '../../crm/schemas/customer-activity.schema';
import { BadRequestException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let mockAppointmentModel: any;
  let mockAvailabilityModel: any;
  let mockCustomerModel: any;
  let mockActivityModel: any;
  let mockEventBus: any;

  beforeEach(async () => {
    mockAppointmentModel = jest.fn().mockImplementation(function (data) {
      this._id = 'apt-123';
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue(this);
    });
    mockAppointmentModel.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([
        {
          _id: 'apt-1',
          title: 'Enterprise Architecture & AI Demo',
          startTime: new Date('2026-08-26T14:00:00.000Z'),
          endTime: new Date('2026-08-26T14:45:00.000Z'),
          status: 'scheduled',
        },
      ]),
    });
    mockAppointmentModel.countDocuments = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockAppointmentModel.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null), // No conflict default
    });

    mockAvailabilityModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          dayOfWeek: 3,
          startTime: '09:00',
          endTime: '17:00',
          slotDurationMinutes: 30,
          isActive: true,
        }),
      }),
    };

    mockCustomerModel = {
      findOne: jest.fn().mockResolvedValue({ _id: 'cust-123', name: 'David Vance' }),
    };

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
        AppointmentsService,
        { provide: getModelToken(Appointment.name), useValue: mockAppointmentModel },
        { provide: getModelToken(Availability.name), useValue: mockAvailabilityModel },
        { provide: getModelToken(Customer.name), useValue: mockCustomerModel },
        { provide: getModelToken(CustomerActivity.name), useValue: mockActivityModel },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('should book an appointment without conflicts', async () => {
    const apt = await service.createAppointment('org-1', 'user-1', {
      title: 'Enterprise AI Demo',
      startTime: '2026-08-26T14:00:00.000Z',
      durationMinutes: 45,
      staffUserId: 'staff-123',
    });

    expect(apt).toBeDefined();
    expect(apt.title).toBe('Enterprise AI Demo');
    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'calendar.appointment_booked',
      'org-1',
      undefined,
      expect.objectContaining({ appointmentId: 'apt-123' }),
    );
  });

  it('should calculate available slots for a target date', async () => {
    const result = await service.getAvailableSlots('org-1', '2026-08-26');
    expect(result.date).toBe('2026-08-26');
    expect(result.slots.length).toBeGreaterThan(0);
    expect(result.slots[0].available).toBe(true);
  });
});
