/* eslint-disable react-hooks/immutability */
// components/reports/Reports.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import {
  fetchReport,
  clearReport,
  exportToExcel
} from '../store/slices/taskSlice';
import { fetchUsers } from '../store/slices/userSlice';
import { fetchCompanies } from '../store/slices/companySlice';
import {
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Reports = () => {
  const dispatch = useDispatch();
  const { report: reportData, isLoading } = useSelector((state) => state.tasks);
  const { users } = useSelector((state) => state.users);
  const { companies } = useSelector((state) => state.companies);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [filters, setFilters] = useState({
    companyId: '',
    userId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    reportType: 'monthly'
  });

  // State for tree expansion - MOVED TO TOP LEVEL
  const [expandedTasks, setExpandedTasks] = useState({});
  const [expandedDays, setExpandedDays] = useState({});

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchUsers());
    if (currentUser.role === 'admin') {
      dispatch(fetchCompanies());
    }
    loadReport();
  }, [dispatch]);

  const loadReport = () => {
    dispatch(clearReport());
    dispatch(fetchReport(filters));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = () => {
    loadReport();
  };

  const handleExport = () => {
    dispatch(exportToExcel(filters));
  };

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

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year, label: year.toString() };
  });

  let filteredUsers = [];
  if (Array.isArray(users)) {
    if (currentUser?.role === 'admin') {
      filteredUsers = users;
    } else if (currentUser?.role === 'manager') {
      filteredUsers = users.filter(user => user.role === 'staff');
    } else if (currentUser?.role === 'staff') {
      filteredUsers = users.filter(user => user._id === currentUser._id);
    }
  }

  const report = reportData?.report;
  const summary = report?.summary || {};
  const detailed = report?.detailed || [];
  const userReports = report?.userReports || [];
  const chartData = report?.chartData || [];

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Comprehensive reports and analytics for performance tracking
          </p>
        </div>

        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {currentUser.role === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                  Company
                </label>
                <select
                  name="companyId"
                  value={filters.companyId}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                User
              </label>
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
              >
                <option value="">All Users</option>
                {filteredUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Month
              </label>
              <select
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Year
              </label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
              >
                {years.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {['monthly', 'quarterly', 'yearly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilters(prev => ({ ...prev, reportType: type }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${filters.reportType === type
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)} Report
                </button>
              ))}
            </div>

            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={handleExport}
                className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center shadow-sm transition-all duration-200"
                disabled={!report}
              >
                <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-500" />
                Export
              </button>
              <button
                onClick={handleGenerateReport}
                className="flex-1 sm:flex-none justify-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Generating report...</p>
          </div>
        )}

        {/* Report Data */}
        {!isLoading && report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalTasks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-green-100">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.completedTasks || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-yellow-100">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Hours</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.totalHours || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <UserGroupIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion</p>
                    <p className="text-2xl font-bold text-gray-900">{summary.completionRate || 0}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            {chartData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Task Status Distribution</h3>
                  <div className="h-80">
                    {chartData.filter(item => item.value > 0).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData.filter(item => item.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {chartData.filter(item => item.value > 0).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No task data available
                      </div>
                    )}
                  </div>
                </div>

                {userReports.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">User Performance</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userReports} barGap={8}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                          <Tooltip
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Legend verticalAlign="top" align="right" />
                          <Bar dataKey="completedTasks" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="totalTasks" name="Total Assigned" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Monthly Calendar Chart */}
            {detailed.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Monthly Work Calendar</h3>
                  <p className="text-sm text-gray-600">
                    Daily status overview for {months.find(m => m.value === parseInt(filters.month))?.label} {filters.year}
                  </p>
                </div>
                <div className="p-6">
                  {/* Legend */}
                  <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-green-500"></div>
                      <span className="text-sm text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-blue-500"></div>
                      <span className="text-sm text-gray-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-yellow-500"></div>
                      <span className="text-sm text-gray-600">Pending</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
                      <span className="text-sm text-gray-600">Not in Range</span>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b sticky left-0 bg-white z-10">
                            Task
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">
                            User
                          </th>
                          {Array.from({ length: 31 }, (_, i) => {
                            const day = i + 1;
                            const daysInMonth = new Date(parseInt(filters.year), parseInt(filters.month), 0).getDate();
                            const isValidDay = day <= daysInMonth;
                            return (
                              <th
                                key={day}
                                className={`px-1 py-2 text-center text-xs font-medium text-gray-600 border-b min-w-[32px] ${!isValidDay ? 'bg-gray-100' : ''
                                  }`}
                              >
                                {isValidDay ? day : ''}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {detailed.map((task) => {
                          const daysInMonth = new Date(parseInt(filters.year), parseInt(filters.month), 0).getDate();
                          const taskStart = new Date(task.startDate);
                          const taskEnd = new Date(task.endDate);
                          taskStart.setHours(0, 0, 0, 0);
                          taskEnd.setHours(23, 59, 59, 999);

                          // Create a map of days for quick lookup
                          const daysMap = new Map();
                          (task.days || []).forEach(day => {
                            const dayDate = new Date(day.date);
                            dayDate.setHours(0, 0, 0, 0);
                            const dayNum = dayDate.getDate();
                            daysMap.set(dayNum, day);
                          });

                          return (
                            <tr key={task.taskId} className="hover:bg-gray-50">
                              <td className="px-4 py-3 border-b sticky left-0 bg-white z-10">
                                <div className="font-medium text-sm text-gray-900">{task.title}</div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {format(new Date(task.startDate), 'MMM dd')} - {format(new Date(task.endDate), 'MMM dd')}
                                </div>
                              </td>
                              <td className="px-4 py-3 border-b">
                                <div className="text-sm text-gray-700">
                                  {typeof task.assignedTo === 'object' && task.assignedTo !== null
                                    ? task.assignedTo.name
                                    : task.assignedTo || 'N/A'}
                                </div>
                              </td>
                              {Array.from({ length: 31 }, (_, i) => {
                                const day = i + 1;
                                const isValidDay = day <= daysInMonth;
                                const currentDay = new Date(parseInt(filters.year), parseInt(filters.month) - 1, day);
                                currentDay.setHours(0, 0, 0, 0);

                                const isInTaskRange = currentDay >= taskStart && currentDay <= taskEnd;
                                const dayData = daysMap.get(day);

                                let status = 'not-in-range';
                                if (isInTaskRange) {
                                  status = dayData ? dayData.status : 'pending';
                                }

                                const getStatusColor = (status) => {
                                  switch (status) {
                                    case 'completed':
                                      return 'bg-green-500';
                                    case 'in-progress':
                                      return 'bg-blue-500';
                                    case 'pending':
                                      return 'bg-yellow-500';
                                    default:
                                      return 'bg-gray-200 border border-gray-300';
                                  }
                                };

                                return (
                                  <td
                                    key={day}
                                    className={`px-1 py-2 border-b text-center ${!isValidDay ? 'bg-gray-100' : ''}`}
                                    title={
                                      isValidDay && isInTaskRange
                                        ? `Day ${day}: ${status}${dayData ? ` (${dayData.totalSubtasks || 0} subtasks, ${dayData.totalHours || 0}h)` : ' (No work done)'}`
                                        : ''
                                    }
                                  >
                                    {isValidDay && (
                                      <div
                                        className={`w-6 h-6 mx-auto rounded ${getStatusColor(status)}`}
                                      ></div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Report Table - Tree Structure */}
            {detailed.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold">Detailed Task Report</h3>
                  <p className="text-sm text-gray-600">
                    {months.find(m => m.value === parseInt(filters.month))?.label} {filters.year}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task / Date / Subtask
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To / Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hours
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Progress
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {detailed.map((task) => {
                        const isTaskExpanded = expandedTasks[task.taskId];

                        return (
                          <React.Fragment key={task.taskId}>
                            {/* Task Row */}
                            <tr
                              className="bg-gray-50 hover:bg-gray-100 cursor-pointer"
                              onClick={() => toggleTask(task.taskId)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  {task.days && task.days.length > 0 ? (
                                    isTaskExpanded ? (
                                      <ChevronDownIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    ) : (
                                      <ChevronRightIcon className="h-5 w-5 text-gray-400 mr-2" />
                                    )
                                  ) : (
                                    <div className="w-5 mr-2" />
                                  )}
                                  <div>
                                    <div className="font-bold text-gray-900">{task.title}</div>
                                    {task.description && (
                                      <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                                    )}
                                    <div className="text-xs text-gray-500 mt-1">
                                      {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium">
                                  {typeof task.assignedTo === 'object' && task.assignedTo !== null
                                    ? task.assignedTo.name
                                    : task.assignedTo || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {typeof task.assignedTo === 'object' && task.assignedTo !== null
                                    ? task.assignedTo.email
                                    : ''}
                                </div>
                                {typeof task.company === 'object' && task.company !== null && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {task.company.name}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                  {task.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {task.priority?.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 font-medium">
                                  {task.totalHours || 0}h
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${task.progress || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-sm text-gray-900">{task.progress || 0}%</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {task.completedSubtasks || 0}/{task.totalSubtasks || 0} subtasks
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Days */}
                            {isTaskExpanded && task.days && task.days.map((day) => {
                              const dayKey = `${task.taskId}-${day.date}`;
                              const isDayExpanded = expandedDays[dayKey];

                              return (
                                <React.Fragment key={dayKey}>
                                  {/* Day Row */}
                                  <tr
                                    className="bg-blue-50 hover:bg-blue-100 cursor-pointer"
                                    onClick={() => toggleDay(dayKey)}
                                  >
                                    <td className="px-6 py-3" colSpan="6">
                                      <div className="flex items-center pl-8">
                                        {isDayExpanded ? (
                                          <ChevronDownIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        ) : (
                                          <ChevronRightIcon className="h-4 w-4 text-gray-400 mr-2" />
                                        )}
                                        <CalendarIcon className="h-4 w-4 text-blue-600 mr-2" />
                                        <span className="text-sm font-semibold text-gray-900">
                                          {format(new Date(day.date), 'EEEE, MMMM dd, yyyy')}
                                        </span>
                                        <span className="ml-3 text-xs text-gray-500">
                                          ({day.subTasks?.length || 0} subtask{day.subTasks?.length !== 1 ? 's' : ''})
                                        </span>
                                      </div>
                                    </td>
                                  </tr>

                                  {/* Expanded Subtasks */}
                                  {isDayExpanded && day.subTasks && day.subTasks.map((subTask, idx) => (
                                    <tr key={`${dayKey}-${idx}`} className="hover:bg-gray-50">
                                      <td className="px-6 py-3">
                                        <div className="flex items-center pl-16">
                                          <CheckCircleIcon className={`h-4 w-4 mr-2 ${subTask.status === 'completed' ? 'text-green-500' : 'text-gray-300'
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
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${subTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          subTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                            subTask.status === 'delayed' ? 'bg-red-100 text-red-800' :
                                              'bg-yellow-100 text-yellow-800'
                                          }`}>
                                          {subTask.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </span>
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
                                            Completed: {format(new Date(subTask.completedAt), 'MMM dd, hh:mm a')}
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
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* User Reports Summary */}
            {userReports.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">User Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userReports.map((user) => (
                    <div key={user.userId || user.name} className="border rounded-lg p-4 hover:bg-gray-50">
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tasks:</span>
                          <span className="font-medium">{user.completedTasks || 0}/{user.totalTasks || 0} completed</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Hours:</span>
                          <span className="font-medium">{user.totalHours || 0} hours</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Avg Progress:</span>
                          <span className="font-medium">{user.avgProgress || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* No Data State */}
        {!isLoading && !report && (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No report generated</h3>
            <p className="mt-2 text-gray-600">Use the filters above to generate a report.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;