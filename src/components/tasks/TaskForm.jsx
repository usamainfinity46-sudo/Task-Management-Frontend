/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/userSlice'; // adjust pat
import { fetchCompanies } from '../../store/slices/companySlice'; // adjust pat
import Button from '../common/Button';


const TaskForm = ({ onSubmit, onCancel, userRole, companyId, initialData }) => {
  const { users } = useSelector((state) => state.users);
  const { companies } = useSelector((state) => state.companies);
  // console.log("user ", users);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    company: companyId || '',
    startDate: '',
    endDate: '',
    priority: 'medium',
    ...initialData
  });

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCompanies())
  }, [dispatch]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!formData.startDate) {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        startDate: today,
        endDate: nextWeek
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log("companies  ", companies);


  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.assignedTo) newErrors.assignedTo = 'Please assign to a user';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const filteredUsers = users.filter(user => {
    if (userRole === 'admin') {

      return user.role !== 'admin';
    } else if (userRole === 'manager') {
      // Manager can see only staff, exclude admin & manager
      return user.role === 'staff';
    } else {
      // Staff cannot see anyone else
      return false;
    }
  });


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign To *
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none bg-white ${errors.assignedTo ? 'border-red-500' : 'border-gray-300'
              }`}
          >
            <option value="">Select User</option>
            {filteredUsers.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>



      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;