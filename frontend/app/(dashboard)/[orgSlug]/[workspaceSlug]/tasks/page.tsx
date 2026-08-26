'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  Filter,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Badge } from '../../../../../components/ui/badge';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';

const fallbackTasks = [
  {
    id: 'task-1',
    title: 'Prepare Custom Proposal Document for Global Logistics',
    assignee: 'Alex Rivera',
    relatedCustomer: 'Global Logistics Corp',
    priority: 'HIGH',
    status: 'In Progress',
    dueDate: '2026-08-27',
    isAiGenerated: true,
    source: 'Workflow: Inbound Lead Qualification',
  },
  {
    id: 'task-2',
    title: 'Verify WhatsApp Webhook Rate Limit Throttle Settings',
    assignee: 'Maria Santos',
    relatedCustomer: 'HealthTech Clinics',
    priority: 'MEDIUM',
    status: 'Todo',
    dueDate: '2026-08-28',
    isAiGenerated: false,
    source: 'Manual Task',
  },
  {
    id: 'task-3',
    title: 'Review Overdue Invoice #INV-2026-088 Follow-up',
    assignee: 'Alex Rivera',
    relatedCustomer: 'Nexus FinServe',
    priority: 'HIGH',
    status: 'Completed',
    dueDate: '2026-08-25',
    isAiGenerated: true,
    source: 'Workflow: Automated Invoice Escalation',
  },
];

export default function TasksPage() {
  const params = useParams();
  const orgSlug = params?.orgSlug as string;
  const wsSlug = (params?.workspaceSlug as string) || 'default';

  const [tasks, setTasks] = useState(fallbackTasks);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, status: t.status === 'Completed' ? 'Todo' : 'Completed' } : t
      )
    );
  };

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.relatedCustomer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-neutral-200/80 dark:border-neutral-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Automated Tasks & Operations
            </h1>
            <Badge variant="purple" className="text-[10px] font-mono">
              Workflow Generated
            </Badge>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Tasks automatically created by DAG workflows and assigned to staff members.
          </p>
        </div>

        <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
          <Plus className="h-3.5 w-3.5" />
          <span>Create Task</span>
        </Button>
      </div>

      {/* Task List Table */}
      <Card className="border-neutral-200/80 dark:border-neutral-800/80">
        <CardHeader className="py-3 px-5 border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-neutral-900 dark:text-white">
            Task Queue ({filteredTasks.length})
          </CardTitle>
          <div className="w-64">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs">
            {filteredTasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className="p-4 flex items-center justify-between hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTask(task.id)}
                      className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div>
                      <h3
                        className={`font-semibold ${
                          isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Client: <strong className="text-neutral-700 dark:text-neutral-300">{task.relatedCustomer}</strong> • Assigned to: {task.assignee}
                      </p>
                      {task.isAiGenerated && (
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-0.5 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {task.source}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <Badge
                      variant={
                        task.priority === 'HIGH'
                          ? 'destructive'
                          : task.priority === 'MEDIUM'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[9px]"
                    >
                      {task.priority}
                    </Badge>
                    <span suppressHydrationWarning className="text-neutral-400">
                      Due {task.dueDate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
