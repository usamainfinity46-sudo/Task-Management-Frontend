/* eslint-disable react-hooks/set-state-in-effect */
// components/tasks/SubTaskForm.jsx
import React, { useState, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { TASK_STATUS } from '../../utils/constants';

const SubTaskForm = ({ onSubmit, onCancel, task, initialData }) => {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    hoursSpent: 0,
    remarks: '',
    status: TASK_STATUS.IN_PROGRESS,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  // Set default date
  useEffect(() => {
    if (!formData.date && task) {
      const getDateOnly = (dateStr) => new Date(dateStr).toISOString().split('T')[0];

      const today = getDateOnly(new Date());
      const taskStart = getDateOnly(task.startDate);
      const taskEnd = getDateOnly(task.endDate);

      let defaultDate = today;
      if (today < taskStart) defaultDate = taskStart;
      if (today > taskEnd) defaultDate = taskEnd;

      setFormData(prev => ({ ...prev, date: defaultDate }));
    }
  }, [task, formData.date]);

  // Helper function to get date-only string (YYYY-MM-DD)
  const getDateOnly = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    const getUserRole = () => {
      try {
        const userDataStr = localStorage.getItem('user');
        if (!userDataStr) return '';

        const userData = JSON.parse(userDataStr);
        const role = userData?.role || '';
        return typeof role === 'string' ? role.trim().toLowerCase() : '';
      } catch (error) {
        console.error('Error getting user role:', error);
        return '';
      }
    };

    const role = getUserRole();
    setUserRole(role);
    setIsManager(role === 'staff');
    setLoadingRole(false);
  }, []);

  const validate = () => {
    const newErrors = {};

    // Validate date
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (task) {
      const selectedDateOnly = getDateOnly(formData.date);
      const startDateOnly = getDateOnly(task.startDate);
      const endDateOnly = getDateOnly(task.endDate);

      if (selectedDateOnly < startDateOnly) {
        newErrors.date = 'Date cannot be before task start date';
      }
      if (selectedDateOnly > endDateOnly) {
        newErrors.date = 'Date cannot be after task end date';
      }
    }

    // Validate description
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    // Validate hours spent
    if (formData.hoursSpent < 0 || formData.hoursSpent > 24) {
      newErrors.hoursSpent = 'Hours must be between 0 and 24';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Form data before validation:', formData);

    if (validate()) {
      // Ensure date is in YYYY-MM-DD format
      const submissionData = {
        ...formData,
        date: getDateOnly(formData.date),
        description: formData.description.trim(),
        hoursSpent: Number(formData.hoursSpent) || 0
      };

      console.log('Submitting data:', submissionData);
      onSubmit(submissionData);
    } else {
      console.log('Validation errors:', errors);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hoursSpent' ? parseFloat(value) || 0 : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const canPerformActions = (userRole === 'manager' || userRole === 'admin') && !isManager;


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
              min={task ? new Date(task.startDate).toISOString().split('T')[0] : ''}
              max={task ? new Date(task.endDate).toISOString().split('T')[0] : ''}
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hours Spent
          </label>
          <input
            type="number"
            name="hoursSpent"
            value={formData.hoursSpent}
            onChange={handleChange}
            min="0"
            max="24"
            step="0.5"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.hoursSpent ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="0"
          />
          {errors.hoursSpent && (
            <p className="mt-1 text-sm text-red-600">{errors.hoursSpent}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="What needs to be done on this day?"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remarks
        </label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Any additional notes or comments..."
        />
      </div>
      {canPerformActions &&
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>}


      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Progress' : 'Add Progress'}
        </button>
      </div>
    </form>
  );
};

export default SubTaskForm;