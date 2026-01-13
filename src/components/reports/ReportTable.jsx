/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const ReportTable = ({ data }) => {
  const [expandedTasks, setExpandedTasks] = useState({});
  const [expandedDays, setExpandedDays] = useState({});

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const toggleDay = (dayKey) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      delayed: 'bg-red-100 text-red-800'
    };
    
    const formatStatus = (str) => {
      return str.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
        {formatStatus(status)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.medium}`}>
        {priority?.toUpperCase()}
      </span>
    );
  };

  // Group subtasks by date
  const groupSubTasksByDate = (task) => {
    const days = task.days || [];
    return days.map(day => ({
      date: day.date,
      subTasks: day.subTasks || []
    })).filter(day => day.subTasks.length > 0);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task / Date / Subtask
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hours
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progress
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data && data.length > 0 ? (
            data.map((task) => {
              const isTaskExpanded = expandedTasks[task._id || task.taskId];
              const dayGroups = groupSubTasksByDate(task);
              
              return (
                <React.Fragment key={task._id || task.taskId}>
                  {/* Task Row */}
                  <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleTask(task._id || task.taskId)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {dayGroups.length > 0 ? (
                          isTaskExpanded ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                          )
                        ) : (
                          <div className="w-5 mr-2" />
                        )}
                        <div>
                          <div className="text-sm font-bold text-gray-900">{task.title}</div>
                          {task.description && (
                            <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {typeof task.assignedTo === 'object' && task.assignedTo !== null 
                          ? task.assignedTo.name 
                          : task.assignedTo || 'N/A'}
                      </div>
                      {task.company && (
                        <div className="text-xs text-gray-500">
                          {typeof task.company === 'object' && task.company !== null 
                            ? task.company.name 
                            : task.company}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatNumber(task.totalHours || 0)}h
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{task.progress || 0}%</span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Days */}
                  {isTaskExpanded && dayGroups.map((dayGroup) => {
                    const dayKey = `${task._id || task.taskId}-${dayGroup.date}`;
                    const isDayExpanded = expandedDays[dayKey];
                    
                    return (
                      <React.Fragment key={dayKey}>
                        {/* Day Row */}
                        <tr className="bg-blue-50 hover:bg-blue-100 cursor-pointer" onClick={() => toggleDay(dayKey)}>
                          <td className="px-6 py-3" colSpan="6">
                            <div className="flex items-center pl-8">
                              {isDayExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-400 mr-2" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
                              )}
                              <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                              <span className="text-sm font-semibold text-gray-900">
                                {format(new Date(dayGroup.date), 'EEEE, MMMM dd, yyyy')}
                              </span>
                              <span className="ml-3 text-xs text-gray-500">
                                ({dayGroup.subTasks.length} subtask{dayGroup.subTasks.length !== 1 ? 's' : ''})
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Subtasks */}
                        {isDayExpanded && dayGroup.subTasks.map((subTask, idx) => (
                          <tr key={`${dayKey}-${idx}`} className="hover:bg-gray-50">
                            <td className="px-6 py-3">
                              <div className="flex items-center pl-16">
                                <CheckCircleIcon className={`h-4 w-4 mr-2 ${
                                  subTask.status === 'completed' ? 'text-green-500' : 'text-gray-300'
                                }`} />
                                <div>
                                  <div className="text-sm text-gray-900">{subTask.description}</div>
                                  {subTask.remarks && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      <span className="font-medium">Remarks:</span> {subTask.remarks}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {subTask.createdAt && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {format(new Date(subTask.createdAt), 'hh:mm a')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {getStatusBadge(subTask.status)}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <span className="text-xs text-gray-500">-</span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{subTask.hoursSpent || 0}h</div>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap">
                              {subTask.completedAt && (
                                <div className="text-xs text-gray-500">
                                  {format(new Date(subTask.completedAt), 'MMM dd, hh:mm a')}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                No data available for the selected period
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;