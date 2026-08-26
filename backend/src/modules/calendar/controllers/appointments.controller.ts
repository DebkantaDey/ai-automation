import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from '../services/appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  SetAvailabilityDto,
} from '../dto/appointment.dto';
import { JwtAuthGuard } from '../../../core/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../core/auth/guards/permissions.guard';
import {
  CurrentOrganizationId,
  CurrentWorkspaceId,
  CurrentUser,
  RequireTenant,
} from '../../../core/tenancy/tenant.decorators';
import { RequirePermissions } from '../../../core/auth/decorators/permissions.decorator';
import { Permission } from '../../../core/common/enums/permission.enum';

@ApiTags('Calendar & Appointments')
@Controller('calendar/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post()
  @RequirePermissions(Permission.CALENDAR_WRITE)
  @ApiOperation({ summary: 'Book a new appointment' })
  async createAppointment(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.createAppointment(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get()
  @RequirePermissions(Permission.CALENDAR_READ)
  @ApiOperation({ summary: 'List booked appointments' })
  async listAppointments(
    @CurrentOrganizationId() orgId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('staffUserId') staffUserId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.appointmentsService.listAppointments(orgId, {
      startDate,
      endDate,
      staffUserId,
      customerId,
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get('availability')
  @RequirePermissions(Permission.CALENDAR_READ)
  @ApiOperation({ summary: 'Calculate available booking time slots for a given date' })
  async getAvailableSlots(
    @CurrentOrganizationId() orgId: string,
    @Query('date') date: string,
    @Query('staffUserId') staffUserId?: string,
  ) {
    return this.appointmentsService.getAvailableSlots(orgId, date, staffUserId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Post('availability')
  @RequirePermissions(Permission.CALENDAR_WRITE)
  @ApiOperation({ summary: 'Configure staff working hours availability' })
  async setAvailability(
    @CurrentOrganizationId() orgId: string,
    @CurrentWorkspaceId() wsId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.appointmentsService.setAvailability(orgId, userId, dto, wsId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Get(':id')
  @RequirePermissions(Permission.CALENDAR_READ)
  @ApiOperation({ summary: 'Get appointment details' })
  async getAppointmentById(
    @CurrentOrganizationId() orgId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.getAppointmentById(orgId, id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Patch(':id')
  @RequirePermissions(Permission.CALENDAR_WRITE)
  @ApiOperation({ summary: 'Reschedule or update appointment' })
  async updateAppointment(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.updateAppointment(orgId, id, dto, userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireTenant()
  @Delete(':id')
  @RequirePermissions(Permission.CALENDAR_WRITE)
  @ApiOperation({ summary: 'Cancel appointment' })
  async deleteAppointment(
    @CurrentOrganizationId() orgId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.appointmentsService.deleteAppointment(orgId, id, userId);
  }
}
