import api from './api';

export const dashboardService = {
  // Get main dashboard stats
  getDashboardStats: () => api.get('/dashboard/stats'),
  
  // Get user-specific dashboard
  getUserDashboard: () => api.get('/dashboard/user'),
  
  // Get manager dashboard
  getManagerDashboard: () => api.get('/dashboard/manager'),
  
  
  // Get admin dashboard
  getAdminDashboard: () => api.get('/dashboard/admin'),
  
  // Get role-based dashboard
  getRoleBasedDashboard: (role) => {
    switch (role) {
      case 'admin':
        return api.get('/dashboard/admin');
      case 'manager':
        return api.get('/dashboard/manager');
      default:
        return api.get('/dashboard/user');
    }
  }
};

export const getDashboardCards = async () => {
  return api.get('/dashboard/stats'); 
};

export const getRecentActivity = async () => {
  return api.get('/dashboard/user')
}