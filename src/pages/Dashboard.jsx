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
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <ErrorAlert
          message={error}
          onDismiss={() => setError(null)}
          retryAction={loadDashboard}
        />
      )}

      {/* Welcome Section with Refresh Button */}
      <div className="bg-white shadow rounded-lg p-6 relative">
        <div className="absolute top-4 right-4">
          <RefreshButton
            onClick={handleRefresh}
            isLoading={isLoading}
            lastUpdated={stats.lastUpdated}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {getWelcomeMessage()}
            </p>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm text-gray-500">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData.companiesWithStats.slice(0, 6).map((company) => (
              <div key={company._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900">{company.name}</h4>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">Tasks: {company.taskCount}</p>
                  <p className="text-sm text-gray-600">Users: {company.userCount}</p>
                  <p className="text-sm text-gray-600">
                    Completion: {company.completedTasks || 0}/{company.taskCount || 0}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {user?.role === 'manager' && displayData.teamMembers && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="space-y-4">
            {displayData.teamMembers.map((member) => (
              <div key={member._id} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.email}</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for Staff */}
      {user?.role === 'staff' && displayData.myTasks && displayData.myTasks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">My Tasks</h3>
          <div className="space-y-3">
            {displayData.myTasks.slice(0, 5).map((task) => (
              <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                      }`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Due: {new Date(task.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="w-12">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${task.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-1">{task.progress || 0}%</p>
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