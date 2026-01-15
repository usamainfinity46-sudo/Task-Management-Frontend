import React from 'react';
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants';

const TaskFilters = ({ filters, onChange, onClear }) => {
  const handleChange = (name, value) => {
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm appearance-none"
          >
            <option value="">All Status</option>
            {Object.values(TASK_STATUS).map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm appearance-none"
          >
            <option value="">All Priorities</option>
            {Object.values(TASK_PRIORITY).map(priority => (
              <option key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date From
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date To
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm"
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          Clear all filters
        </button>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleChange('sort', 'newest')}
            className={`px-3 py-1 text-sm rounded ${filters.sort === 'newest'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Newest First
          </button>
          <button
            type="button"
            onClick={() => handleChange('sort', 'priority')}
            className={`px-3 py-1 text-sm rounded ${filters.sort === 'priority'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            By Priority
          </button>
          <button
            type="button"
            onClick={() => handleChange('sort', 'dueDate')}
            className={`px-3 py-1 text-sm rounded ${filters.sort === 'dueDate'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            Due Date
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;