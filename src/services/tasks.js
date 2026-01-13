// services/tasks.js
import api from './api';

export const taskService = {
  // Get tasks with filters
  getTasks: (params) => api.get('/tasks', { params }),
  
  // Get single task
  getTask: (id) => api.get(`/tasks/${id}`),
  
  // Create task
  createTask: (data) => api.post('/tasks', data),
  
  // Update task
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  
  // Delete task
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  
  // Update subtask
  updateSubTask: (taskId, subTaskId, data) => 
    api.put(`/tasks/${taskId}/subtasks/${subTaskId}`, data),
  
  // Add subtask as a Day
addSubTask: (taskId, data) =>
  api.post(`/tasks/${taskId}/subtaskDays`, data),

  
  // Delete subtask
  deleteSubTask: (taskId, subTaskId) => 
    api.delete(`/tasks/${taskId}/subtasks/${subTaskId}`),
  
  // Get dashboard stats
  getDashboardStats: () => api.get('/tasks/dashboard/stats'),
  
  // Get reports
  getReport: (params) => api.get('/tasks/reports', { params }),
  
  // Export to Excel
  exportToExcel: (params) => api.get('/tasks/reports/export', { 
    params,
    responseType: 'blob'
  })
};