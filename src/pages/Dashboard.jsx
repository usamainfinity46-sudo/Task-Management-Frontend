import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData, fetchDashboardStats } from '../store/slices/dashboardSlice';
import {
  selectDashboardStats,
  selectDashboardLoading,
  selectCurrentDashboard,
  selectChartData,
  selectRecentActivities
} from '../store/selectors/dashboardSelectors';
import StatsCards from '../components/dashboard/StatsCards';
import TaskChart from '../components/dashboard/TaskChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import RefreshButton from '../components/common/RefreshButton';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isLoading = useSelector(selectDashboardLoading);
  const stats = useSelector(selectDashboardStats);
  const currentDashboard = useSelector(selectCurrentDashboard);
  const chartData = useSelector(selectChartData);
  const recentActivities = useSelector(selectRecentActivities);
  const [error, setError] = useState(null);

  // Function to load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      // Fetch both general stats and role-based data
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchDashboardData(user?.role))
      ]);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard load error:', err);
    }
  }, [dispatch, user?.role]);

  // Initial load
  useEffect(() => {
    loadDashboard();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboard();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [loadDashboard]);

  // Handle manual refresh
  const handleRefresh = () => {
    loadDashboard();
  };

  if (isLoading && !stats) {
    return <LoadingSpinner fullScreen />;
  }

  // Determine which data to use (prefer current dashboard, fall back to stats)
  const displayData = Object.keys(currentDashboard).length > 0 ? currentDashboard : stats;

  // Get role-based message
  const getWelcomeMessage = () => {
    switch (user?.role) {
      case 'admin':
        return 'Manage your companies, teams, and track performance.';
      case 'manager':
        return 'Manage your team tasks and monitor progress.';
      default:
        return 'View your assigned tasks and update your progress.';
    }
  };

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError(null)}
          retryAction={loadDashboard}
        />
      )}

      {/* Welcome Section with Refresh Button */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <RefreshButton
            onClick={handleRefresh}
            isLoading={isLoading}
            lastUpdated={stats.lastUpdated}
          />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              {getWelcomeMessage()}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <StatsCards
        stats={displayData}
        userRole={user?.role}
        subtasks={stats?.subtasks} // Pass subtasks from generic stats if missing in displayData
      />

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TaskChart
          data={chartData.length > 0 ? chartData : displayData.chartData || []}
          isLoading={isLoading}
        />
        <RecentActivity
          activities={recentActivities.length > 0 ? recentActivities : displayData.recentActivities || []}
          isLoading={isLoading}
        />
      </div>

      {/* Additional Dashboard Sections based on role */}
      {user?.role === 'admin' && displayData.companiesWithStats && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            Company Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.companiesWithStats.slice(0, 6).map((company) => (
              <div key={company._id} className="group p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors pointer-events-none">
                  {company.name}
                </h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tasks</span>
                    <span className="font-medium text-gray-900">{company.taskCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Users</span>
                    <span className="font-medium text-gray-900">{company.userCount}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Completion</span>
                      <span>{Math.round((company.completedTasks || 0) / (company.taskCount || 1) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.round((company.completedTasks || 0) / (company.taskCount || 1) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'manager' && displayData.teamMembers && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Team Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.teamMembers.map((member) => (
              <div key={member._id} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {member.name.charAt(0)}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{member.name}</p>
                  <p className="text-sm text-gray-500 truncate">{member.email}</p>
                </div>
                <span className="ml-2 px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-100 text-blue-800 capitalize">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for Staff */}
      {user?.role === 'staff' && displayData.myTasks && displayData.myTasks.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6">My Recent Tasks</h3>
          <div className="space-y-4">
            {displayData.myTasks.slice(0, 5).map((task) => (
              <div key={task._id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-blue-200 transition-all duration-200">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                      }`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-gray-400">
                      Due {new Date(task.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="w-24 flex flex-col items-end">
                  <span className="text-xs font-medium text-gray-900 mb-1">{task.progress || 0}%</span>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${task.progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;