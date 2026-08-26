'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle2,
  Video,
  User,
  Building,
  Phone,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';

const fallbackAppointments = [
  {
    id: 'apt-1',
    title: 'Enterprise Architecture & AI Demo',
    customerName: 'David Vance',
    company: 'Global Logistics Corp',
    time: '2:00 PM - 2:45 PM',
    date: '2026-08-26',
    status: 'scheduled',
    staff: 'Alex Rivera (Solutions Engineer)',
    channel: 'Google Meet',
    isAiScheduled: true,
  },
  {
    id: 'apt-2',
    title: 'Clinic Automated Reminder Setup Review',
    customerName: 'Dr. Emily Watson',
    company: 'HealthTech Clinics',
    time: '4:30 PM - 5:00 PM',
    date: '2026-08-26',
    status: 'confirmed',
    staff: 'Maria Santos (Account Manager)',
    channel: 'Zoom Call',
    isAiScheduled: true,
  },
  {
    id: 'apt-3',
    title: 'Quarterly Security & SLA Review',
    customerName: 'Michael Chen',
    company: 'Nexus FinServe',
    time: '11:00 AM - 12:00 PM',
    date: '2026-08-27',
    status: 'scheduled',
    staff: 'Alex Rivera (Solutions Engineer)',
    channel: 'In-Person Meeting',
    isAiScheduled: false,
  },
];

export default function CalendarPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [appointments, setAppointments] = useState(fallbackAppointments);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Calendar & Appointments
            </h1>
            <Badge variant="emerald" className="text-[10px] font-mono">
              AI Scheduling Engine
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Automated calendar booking, staff availability search, meeting scheduling, and reminder dispatches.
          </p>
        </div>

        <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
          <Plus className="h-3.5 w-3.5" />
          <span>New Booking Slot</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Upcoming Today & Tomorrow</span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
              <CalendarIcon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">3</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Confirmation Rate</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>AI Booked Demos</span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">18</span>
            <p className="text-[11px] text-purple-600 font-semibold mt-1">Booked via WhatsApp & Webhooks</p>
          </div>
        </Card>

        <Card className="p-4 border-neutral-200/80 dark:border-neutral-800/80">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>No-Show Rate</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-white">2.1%</span>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">Reduced by auto-reminders</p>
          </div>
        </Card>
      </div>

      {/* Appointments List */}
      <Card className="border-neutral-200/80 dark:border-neutral-800/80">
        <CardHeader className="py-3 px-5 border-b border-neutral-100 dark:border-neutral-800">
          <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">
            Upcoming Booked Appointments
          </CardTitle>
          <CardDescription className="text-xs">
            Meetings scheduled with customers and synced to staff calendars
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-neutral-900 dark:text-white">{apt.title}</h3>
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'default'} className="text-[9px] uppercase font-mono">
                      {apt.status}
                    </Badge>
                    {apt.isAiScheduled && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI Booked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Client: <strong className="text-neutral-700 dark:text-neutral-300">{apt.customerName}</strong> ({apt.company}) • Assigned Staff: {apt.staff}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span>{apt.date} • {apt.time}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-sans">
                    <Video className="h-3 w-3 mr-1" />
                    {apt.channel}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
