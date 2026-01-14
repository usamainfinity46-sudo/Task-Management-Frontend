import { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon,

} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';



const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    red: "bg-red-500"
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ stats, userRole, subtasks }) => {
  if (!stats) return null;

  // Normalize data from different backend structures
  // 1. User/Shared: stats.taskCounts (total, completed, pending, etc.)
  // 2. Manager: stats.teamStats (totalTasks, completedTasks, etc.)
  // 3. Admin: stats (totalTasks, tasksByStatus, etc.) or stats.overview

  let data = {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    delayed: 0,
    teamMembers: 0,
    activeCompanies: 0,
    subtasks: {
      total: 0,
      completed: 0,
      pending: 0,
      inProgress: 0,
      delayed: 0
    }
  };

  // If subtasks are passed directly (e.g. from generic stats), use them
  if (subtasks) {
    data.subtasks = subtasks;
  } else if (stats.subtasks) {
    data.subtasks = stats.subtasks;
  }

  if (stats.taskCounts) {
    // User structure
    data = {
      ...data,
      total: stats.taskCounts.total,
      completed: stats.taskCounts.completed,
      pending: stats.taskCounts.pending,
      inProgress: stats.taskCounts.inProgress,
      delayed: stats.taskCounts.delayed
    };
  } else if (stats.teamStats) {
    // Manager structure
    data = {
      ...data,
      total: stats.teamStats.totalTasks,
      completed: stats.teamStats.completedTasks,
      pending: stats.teamStats.pendingTasks,
      inProgress: stats.teamStats.inProgressTasks,
      delayed: stats.teamStats.delayedTasks,
      teamMembers: stats.teamStats.totalMembers
    };
  } else if (stats.totalTasks !== undefined) {
    // Admin/Generic structure
    // Admin might have tasksByStatus but let's try to map common keys first
    data = {
      ...data,
      total: stats.totalTasks,
      // Admin dashboard sends 'overview' or direct stats. 
      // If direct mapping isn't available, we might default to 0 or check nested arrays.
      // Based on dashboardController:
      // tasksByStatus: [{_id: 'completed', count: 10}, ...]

      activeCompanies: stats.totalCompanies || 0,
      teamMembers: stats.totalUsers || 0
    };

    if (stats.tasksByStatus && Array.isArray(stats.tasksByStatus)) {
      data.completed = stats.tasksByStatus.find(s => s._id === 'completed')?.count || 0;
      data.pending = stats.tasksByStatus.find(s => s._id === 'pending')?.count || 0;
      data.inProgress = stats.tasksByStatus.find(s => s._id === 'in-progress')?.count || 0;
      data.delayed = stats.tasksByStatus.find(s => s._id === 'delayed')?.count || 0;
    }
  } else if (stats.tasks) {
    // General stats structure
    data = {
      ...data,
      total: stats.tasks.total,
      completed: stats.tasks.completed,
      pending: stats.tasks.pending,
      inProgress: stats.tasks.inProgress,
      delayed: stats.tasks.delayed
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Tasks"
        value={data.total}
        icon={CalendarDaysIcon}
        color="blue"
      />

      {userRole === 'staff' && (
        <StatCard
          title="Total Subtasks"
          value={data.subtasks.total}
          icon={CalendarDaysIcon}
          color="blue"
        />
      )}
      <StatCard
        title="Completed Tasks"
        value={data.completed}
        icon={CheckCircleIcon}
        color="green"
      />
      <StatCard
        title="In Progress"
        value={data.inProgress}
        icon={ArrowTrendingUpIcon}
        color="orange"
      />
      <StatCard
        title="Pending Tasks"
        value={data.pending}
        icon={ClockIcon}
        color="yellow"
      />
      <StatCard
        title="Delay Tasks"
        value={data.delayed}
        icon={ExclamationTriangleIcon}
        color="red"
      />

      {(data.teamMembers > 0 || stats.teamStats) && (
        <StatCard
          title="Team Members"
          value={data.teamMembers}
          icon={UserGroupIcon}
          color="purple"
        />
      )}

      {data.activeCompanies > 0 && (
        <StatCard
          title="Active Companies"
          value={data.activeCompanies}
          icon={BuildingOfficeIcon}
          color="indigo"
        />
      )}
    </div>
  );
};

export default StatsCards;
