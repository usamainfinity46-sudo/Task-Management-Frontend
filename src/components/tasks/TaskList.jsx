/* eslint-disable no-unused-vars */
// components/tasks/TaskList.jsx
import React from 'react';
import { format } from 'date-fns';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import SubTaskList from './SubTaskList';
import { TASK_STATUS } from '../../utils/constants';

const TaskList = ({
  tasks,
  onUpdateStatus,
  onUpdateSubTask,
  onDeleteSubTask,
  onAddSubTask,
  onEdit,
  onDelete,
  userRole,
  currentUserId
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in-progress': return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'delayed': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      {status}
    </span>;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.medium}`}>
      {priority}
    </span>;
  };

  const canEditTask = (task) => {
    if (userRole === 'admin') return true;
    if (userRole === 'manager') return true;
    if (userRole === 'staff' && task.assignedTo?._id === currentUserId) return true;
    return false;
  };

  const canDeleteTask = (task) => {
    if (userRole === 'admin') return true;
    if (userRole === 'manager') return true;
    return false;
  };

  const handleStatusChange = (taskId, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(taskId, newStatus);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        // Calculate subtask statistics from days array
        const totalSubtasks = task.days?.reduce((sum, day) =>
          sum + (day.subTasks?.length || 0), 0
        ) || 0;

        const completedSubtasks = task.days?.reduce((sum, day) =>
          sum + (day.subTasks?.filter(st => st.status === 'completed').length || 0), 0
        ) || 0;

        return (
          <div key={task._id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Assigned to:</span> {task.assignedTo?.name || 'Unassigned'}
                    </div>
                    <div>
                      <span className="font-medium">Dates:</span> {format(new Date(task.startDate), 'MMM dd')} - {format(new Date(task.endDate), 'MMM dd, yyyy')}
                    </div>
                    {/* {task.company && (
                      <div>
                        <span className="font-medium">Company:</span> {task.company.name}
                      </div>
                    )} */}
                  </div>
                </div>
                {/* Actions */}
                <div className="ml-4 flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    {canEditTask(task) && onEdit && (
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit Task"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}

                    {/* Delete Button */}
                    {canDeleteTask(task) && onDelete && (
                      <button
                        onClick={() => onDelete(task._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Task"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  {/* Status Dropdown
                  {canEditTask(task) && (
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className="mt-2 block w-full pl-3 pr-8 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Object.entries(TASK_STATUS).map(([key, value]) => (
                        <option key={key} value={value}>{value}</option>
                      ))}
                    </select>
                  )} */}
                </div>
              </div>
            </div>
            {/* Subtasks Section - Pass days array instead of subTasks */}
            <div className="border-t">
              <SubTaskList
                days={task.days || []}
                taskId={task._id}
                onUpdateSubTask={onUpdateSubTask}
                onDeleteSubTask={onDeleteSubTask}
                canEdit={canEditTask(task)}
                onAddSubTask={onAddSubTask}
              />
            </div>
          </div>
        );
      })}
      {tasks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No tasks found. Create your first task to get started.
        </div>
      )}
    </div>
  );
};

export default TaskList;