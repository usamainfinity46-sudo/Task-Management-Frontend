/* eslint-disable react-hooks/set-state-in-effect */
// components/tasks/SubTaskForm.jsx
import React, { useState, useEffect } from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { TASK_STATUS } from '../../utils/constants';

const SubTaskForm = ({ onSubmit, onCancel, task, initialData }) => {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    hoursSpent: 5, // Changed from 0 to 5
    remarks: '',
    status: TASK_STATUS.IN_PROGRESS,
    ...initialData
  });

  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState('');
  const [isManager, setIsManager] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  // Helper function to get date-only string (YYYY-MM-DD)
  const getDateOnly = (dateInput) => {
    if (!dateInput) return '';

    let date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else {
      return '';
    }

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return '';
    }

    // Get date in YYYY-MM-DD format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Set default date to today
  useEffect(() => {
    // If editing existing data, use its date
    if (initialData && initialData.date) {
      return;
    }

    // Only set default date if no date is set
    if (!formData.date) {
      const today = new Date();
      const todayStr = getDateOnly(today);

      setFormData(prev => ({
        ...prev,
        date: todayStr
      }));
    }
  }, [initialData, formData.date]);

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

    // Validate date - just check if it exists
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    // Validate description
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Description is required';
    }

    // Validate hours spent - changed from 24 to 9
    if (formData.hoursSpent < 0 || formData.hoursSpent > 9) {
      newErrors.hoursSpent = 'Hours must be between 0 and 9';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      const submissionData = {
        ...formData,
        date: formData.date,
        description: formData.description.trim(),
        hoursSpent: Number(formData.hoursSpent) || 5
      };
      onSubmit(submissionData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hoursSpent' ? parseFloat(value) || 5 : value
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
              required
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
            max="9" // Changed from 24 to 9
            step="0.5"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${errors.hoursSpent ? 'border-red-500' : 'border-gray-300'
              }`}
            placeholder="5" // Changed from 0 to 5
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
          required
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

      {canPerformActions && (
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
        </div>
      )}

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