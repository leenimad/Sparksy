'use client';

import { useEffect, useState } from 'react';
import { Loader2, BarChart3, TrendingUp, ListChecks, Wrench, Sparkles, PieChart as PieIcon, Globe } from 'lucide-react';
import api from '@/lib/api';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

import Card from '@/components/ui/Card';

interface SubTask {
  _id: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  _id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  subtasks: SubTask[];
}

interface Project {
  _id: string;
  projectName: string;
  techStack: string;
  tasks: Task[];
  user?: { name: string };
}

const STATUS_COLORS = {
  'To Do': '#78716c',
  'In Progress': '#f59e0b',
  'Done': '#10b981',
};

export default function AnalyticsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [acquiredTools, setAcquiredTools] = useState<string[]>([]);
  const [userRole, setUserRole] = useState('builder');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let role = 'builder';
    if (userStr) {
      const user = JSON.parse(userStr);
      role = user.role || 'builder';
      setUserRole(role);
    }
    fetchAnalyticsData(role);
  }, []);

  const fetchAnalyticsData = async (role: string) => {
    try {
      // 1. Role-Aware Fetching: Admins fetch platform-wide projects, Builders fetch personal projects!
      const projectsEndpoint = role === 'admin' ? '/admin/analytics' : '/projects';
      
      const [projectsRes, toolboxRes] = await Promise.all([
        api.get(projectsEndpoint),
        api.get('/auth/toolbox'),
      ]);

      if (projectsRes.data.status === 'success') {
        setProjects(projectsRes.data.data);
      }
      if (toolboxRes.data.status === 'success') {
        setAcquiredTools(toolboxRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  // Data Aggregations
  const allTasks = projects.flatMap((p) => p.tasks || []);
  const todoCount = allTasks.filter((t) => t.status === 'To Do').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'In Progress').length;
  const doneCount = allTasks.filter((t) => t.status === 'Done').length;

  const totalTasks = allTasks.length;
  const overallProgressPercentage = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const statusPieData = [
    { name: 'To Do', value: todoCount, color: STATUS_COLORS['To Do'] },
    { name: 'In Progress', value: inProgressCount, color: STATUS_COLORS['In Progress'] },
    { name: 'Done', value: doneCount, color: STATUS_COLORS['Done'] },
  ].filter((item) => item.value > 0);

  const allSubtasks = allTasks.flatMap((t) => t.subtasks || []);
  const completedSubtasks = allSubtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = allSubtasks.length;

  const allRequiredTools = Array.from(
    new Set(projects.flatMap((p) => p.techStack.split(',').map((tool) => tool.trim())))
  );
  const totalRequiredTools = allRequiredTools.length;
  const ownedToolsCount = acquiredTools.length;
  const toolOwnershipPercentage = totalRequiredTools > 0 
    ? Math.round((ownedToolsCount / totalRequiredTools) * 100) 
    : 0;

  const projectVelocityData = projects.map((p) => {
    const completed = p.tasks.filter((t) => t.status === 'Done').length;
    const remaining = p.tasks.length - completed;
    return {
      name: p.projectName.length > 14 ? p.projectName.slice(0, 14) + '...' : p.projectName,
      Completed: completed,
      Remaining: remaining,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-bold text-stone-800 dark:text-stone-200 mb-1">{label || payload[0].name}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} style={{ color: item.color || item.fill }} className="font-semibold">
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isAdmin = userRole === 'admin';

  return (
    <main className="py-12 px-8 max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* 2. DYNAMIC ROLE-AWARE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-amber-500" />
          {isAdmin ? 'Global Platform Analytics & Velocity' : 'Workspace Analytics & Velocity'}
        </h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          {isAdmin
            ? 'Administrator oversight: Real-time task completion rates and velocity across all platform users.'
            : 'Personal productivity metrics, task completion velocity, and equipment inventory tracking.'}
        </p>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="!p-5 relative overflow-hidden border-amber-500/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isAdmin ? 'Platform Progress' : 'Overall Progress'}
            </span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-800 dark:text-stone-100">{overallProgressPercentage}%</span>
            <span className="text-xs text-emerald-500 font-semibold">{doneCount}/{totalTasks} Tasks Done</span>
          </div>
          <div className="w-full bg-stone-100 dark:bg-stone-900 h-1.5 rounded-full overflow-hidden mt-3">
            <div className="bg-amber-500 h-full transition-all duration-500" style={{ width: `${overallProgressPercentage}%` }}></div>
          </div>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isAdmin ? 'Total Workspaces' : 'Active Workspaces'}
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-stone-800 dark:text-stone-100">{projects.length}</span>
            <p className="text-xs text-stone-500 mt-1">{isAdmin ? 'Scoped projects across platform' : 'Scoped projects in flight'}</p>
          </div>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Checklists Finished</span>
            <ListChecks className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-stone-800 dark:text-stone-100">{completedSubtasks}</span>
            <p className="text-xs text-stone-500 mt-1">Out of {totalSubtasks} micro-tasks</p>
          </div>
        </Card>

        <Card className="!p-5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isAdmin ? 'Unique Tools Required' : 'Toolbox Ownership'}
            </span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-stone-800 dark:text-stone-100">
              {isAdmin ? totalRequiredTools : `${toolOwnershipPercentage}%`}
            </span>
            <p className="text-xs text-stone-500 mt-1">
              {isAdmin ? 'Prerequisites in active use' : `${ownedToolsCount}/${totalRequiredTools} tools sourced`}
            </p>
          </div>
        </Card>
      </div>

      {/* DUAL CHARTS */}
      {projects.length === 0 ? (
        <Card className="text-center py-20 border-dashed border-stone-200 dark:border-stone-800/80">
          <BarChart3 className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <p className="text-stone-700 dark:text-stone-300 font-semibold text-sm">No analytics data available yet</p>
          <p className="text-xs text-stone-400 mt-1">Workspaces must be created to generate live productivity charts.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Donut Task Distribution */}
          <Card className="lg:col-span-5 !p-6 space-y-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">Task Status Distribution</h3>
            </div>
            <p className="text-xs text-stone-400">
              {isAdmin ? 'System-wide task status distribution.' : 'Breakdown of your active tasks.'}
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-xs text-stone-600 dark:text-stone-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Velocity Bar Chart */}
          <Card className="lg:col-span-7 !p-6 space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                {isAdmin ? 'Platform Velocity by Project' : 'Project Velocity Comparison'}
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              {isAdmin ? 'Completed vs remaining tasks across all platform projects.' : 'Completed vs remaining tasks for your workspaces.'}
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectVelocityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#a8a29e' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: '#a8a29e' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    formatter={(value) => <span className="text-xs text-stone-600 dark:text-stone-400">{value}</span>}
                  />
                  <Bar dataKey="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Remaining" fill="#78716c" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}