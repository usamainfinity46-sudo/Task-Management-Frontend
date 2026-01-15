import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
    FiCheckCircle,
    FiClock,
    FiCalendar,
    FiUser,
    FiFileText,
    FiAlertCircle,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiDownload,
    FiSearch,
    FiRefreshCw
} from "react-icons/fi";
import { FaCalendarCheck, FaRegChartBar } from "react-icons/fa";
import { taskService } from "../services/tasks";
import { userService } from "../services/users";
import toast from "react-hot-toast";

const MonthlyWorkingSheet = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [workStatus, setWorkStatus] = useState({});
    const [dailyProgress, setDailyProgress] = useState({});
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedUserId, setSelectedUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [exporting, setExporting] = useState(false);
    const itemsPerPage = 10;

    // Enhanced work status options with better visual hierarchy
    const workStatusOptions = [
        {
            value: 'completed',
            label: '✓',
            color: 'bg-gradient-to-br from-emerald-500 to-green-600',
            border: 'border border-green-200',
            tooltip: 'Complete',
            description: 'All tasks completed for the day'
        },
        {
            value: 'in-progress',
            label: '●',
            color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
            border: 'border border-blue-200',
            tooltip: 'In Progress',
            description: 'Work in progress for the day'
        },
        {
            value: 'pending',
            label: '○',
            color: 'bg-gradient-to-br from-amber-400 to-orange-500',
            border: 'border border-amber-200',
            tooltip: 'Pending',
            description: 'Scheduled but not started'
        },
        {
            value: 'not-started',
            label: '—',
            color: 'bg-gradient-to-br from-gray-200 to-gray-300',
            border: 'border border-gray-200',
            tooltip: 'Not Started',
            description: 'Outside task date range'
        }
    ];

    const [tooltipData, setTooltipData] = useState(null);

    // Handle mouse enter for tooltip
    const handleMouseEnter = (e, data) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipData({
            x: rect.left + rect.width / 2,
            y: rect.top - 10,
            data: data
        });
    };

    const handleMouseLeave = () => {
        setTooltipData(null);
    };

    // Calculate if a day falls within task date range
    const isDayInTaskRange = (day, startDate, endDate) => {
        const currentDay = new Date(selectedYear, selectedMonth - 1, day);
        const taskStart = new Date(startDate);
        const taskEnd = new Date(endDate);

        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(23, 59, 59, 999);
        currentDay.setHours(0, 0, 0, 0);

        return currentDay >= taskStart && currentDay <= taskEnd;
    };

    // Find progress for a specific day
    const findDayProgress = (task, day) => {
        if (!task.days || !Array.isArray(task.days)) return null;

        const targetDate = new Date(selectedYear, selectedMonth - 1, day);
        targetDate.setHours(0, 0, 0, 0);

        return task.days.find(dayEntry => {
            const entryDate = new Date(dayEntry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === targetDate.getTime();
        });
    };

    // Get day's status based on progress and date range
    const getDayStatus = (task, day) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const currentDay = new Date(selectedYear, selectedMonth - 1, day);

        if (!isDayInTaskRange(day, startDate, endDate)) {
            return 'not-started';
        }

        const dayProgress = findDayProgress(task, day);

        if (dayProgress) {
            if (dayProgress.subTasks && dayProgress.subTasks.length > 0) {
                const allCompleted = dayProgress.subTasks.every(st => st.status === 'completed');
                const anyInProgress = dayProgress.subTasks.some(st =>
                    st.status === 'in-progress' || st.status === 'pending'
                );

                if (allCompleted) return 'completed';
                if (anyInProgress || dayProgress.subTasks.length > 0) return 'in-progress';
            }

            const dayHours = dayProgress.subTasks?.reduce((sum, st) => sum + (st.hoursSpent || 0), 0) || 0;
            if (dayHours > 0) {
                return 'in-progress';
            }
        }

        return 'pending';
    };

    // Get day's progress details
    const getDayProgressDetails = (task, day) => {
        const dayProgress = findDayProgress(task, day);
        if (!dayProgress) return null;

        const details = {
            hoursLogged: dayProgress.hoursLogged || 0,
            subTasks: dayProgress.subTasks || [],
            remarks: dayProgress.remarks || '',
            date: dayProgress.date
        };

        if (details.subTasks.length > 0) {
            details.completedSubtasks = details.subTasks.filter(st => st.status === 'completed').length;
            details.totalSubtasks = details.subTasks.length;
            details.subtaskCompletion = Math.round((details.completedSubtasks / details.totalSubtasks) * 100);
        }

        return details;
    };

    // Process API data into UI format
    const processData = useCallback((tasks) => {
        const status = {};
        const dailyProgressData = {};
        const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

        tasks.forEach(task => {
            status[task._id] = {};
            dailyProgressData[task._id] = {};

            for (let day = 1; day <= daysInMonth; day++) {
                const dayStatus = getDayStatus(task, day);

                if (dayStatus !== 'not-started') {
                    status[task._id][day] = {
                        status: dayStatus,
                        taskTitle: task.title,
                        taskDescription: task.description,
                        progress: task.progress,
                        totalHours: task.totalHours,
                        completedSubtasks: task.completedSubtasks,
                        totalSubtasks: task.totalSubtasks,
                        priority: task.priority
                    };

                    const dayProgress = getDayProgressDetails(task, day);
                    if (dayProgress) {
                        dailyProgressData[task._id][day] = dayProgress;
                    }
                }
            }
        });

        setWorkStatus(status);
        setDailyProgress(dailyProgressData);
        setAssignments(tasks);
    }, [selectedMonth, selectedYear]);

    // Fetch users based on selected role
    const fetchUsersByRole = useCallback(async (role) => {
        if (!role) {
            setUsers([]);
            return;
        }
        try {
            setLoadingUsers(true);
            const res = await userService.getUsers({ role });
            if (res.data?.success) {
                setUsers(res.data.users || []);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    // Handle role change
    const handleRoleChange = (e) => {
        const role = e.target.value;
        setSelectedRole(role);
        setSelectedUserId('');
        if (role) {
            fetchUsersByRole(role);
        } else {
            setUsers([]);
        }
    };

    // Handle user selection
    const handleUserChange = (e) => {
        setSelectedUserId(e.target.value);
    };

    // Fetch assignments
    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const params = { month: selectedMonth, year: selectedYear };

            if (selectedRole) params.role = selectedRole;
            if (selectedUserId) params.userId = selectedUserId;
            if (searchTerm) params.search = searchTerm;

            const res = await taskService.getReport(params);

            if (res.data?.success && res.data.report?.detailed) {
                processData(res.data.report.detailed);
            } else {
                setAssignments([]);
                setWorkStatus({});
                setDailyProgress({});
            }
        } catch (error) {
            console.error("Failed to fetch monthly report", error);
            toast.error("Failed to load monthly data");
            setAssignments([]);
            setWorkStatus({});
            setDailyProgress({});
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, selectedUserId, selectedRole, searchTerm, processData]);

    // Export to Excel
    const handleExport = async () => {
        try {
            setExporting(true);
            const params = { month: selectedMonth, year: selectedYear };

            if (selectedRole) params.role = selectedRole;
            if (selectedUserId) params.userId = selectedUserId;

            const response = await taskService.exportReport(params);

            // Create download link
            const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `monthly-report-${selectedYear}-${selectedMonth}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success("Report exported successfully!");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Failed to export report");
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    useEffect(() => {
        if (selectedRole) {
            fetchUsersByRole(selectedRole);
        }
    }, [selectedRole, fetchUsersByRole]);

    // Pagination calculations
    const totalItems = assignments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = assignments.slice(startIndex, startIndex + itemsPerPage);

    // Get work status display for a cell
    const getWorkStatusDisplay = (assignmentId, day) => {
        const data = workStatus[assignmentId]?.[day];
        const progressData = dailyProgress[assignmentId]?.[day];

        if (!data) {
            return {
                config: workStatusOptions.find(opt => opt.value === 'not-started'),
                taskData: null,
                progressData: null
            };
        }

        const statusConfig = workStatusOptions.find(opt => opt.value === data.status);
        return {
            config: statusConfig,
            taskData: data,
            progressData: progressData
        };
    };

    // Handle day cell click
    const handleDayCellClick = (taskId, day) => {
        const status = workStatus[taskId]?.[day];
        const progress = dailyProgress[taskId]?.[day];

        if (status) {
            const action = progress ? "View Details" : "Add Progress";
            toast.success(`Day ${day}: ${status.status.toUpperCase()} - Click to ${action}`);
        }
    };

    // Generate months for dropdown
    const generateMonths = () => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(2000, i, 1);
            months.push({
                value: i + 1,
                label: date.toLocaleDateString('en-US', { month: 'short' }),
                fullLabel: date.toLocaleDateString('en-US', { month: 'long' })
            });
        }
        return months;
    };

    // Generate years for dropdown
    const generateYears = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = -2; i <= 2; i++) {
            years.push(currentYear + i);
        }
        return years;
    };

    // Calculate summary for the month
    const calculateMonthlySummary = () => {
        let totalWorkDays = 0;
        let completedDays = 0;
        let inProgressDays = 0;
        let pendingDays = 0;
        let totalHoursLogged = 0;
        let totalSubtasksCompleted = 0;

        assignments.forEach(assignment => {
            if (workStatus[assignment._id]) {
                Object.entries(workStatus[assignment._id]).forEach(([day, status]) => {
                    totalWorkDays++;
                    if (status.status === 'completed') completedDays++;
                    if (status.status === 'in-progress') inProgressDays++;
                    if (status.status === 'pending') pendingDays++;

                    const progress = dailyProgress[assignment._id]?.[parseInt(day)];
                    if (progress) {
                        totalHoursLogged += progress.hoursLogged || 0;
                        totalSubtasksCompleted += progress.completedSubtasks || 0;
                    }
                });
            }
        });

        const completionRate = totalWorkDays > 0 ? Math.round((completedDays / totalWorkDays) * 100) : 0;

        return {
            totalWorkDays,
            completedDays,
            inProgressDays,
            pendingDays,
            totalHoursLogged,
            totalSubtasksCompleted,
            completionRate
        };
    };

    // Filter assignments based on search term
    const filteredAssignments = assignments.filter(assignment => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            assignment.title.toLowerCase().includes(term) ||
            assignment.description.toLowerCase().includes(term) ||
            assignment.assignedTo?.name.toLowerCase().includes(term) ||
            assignment.taskId.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-600">Loading monthly report...</p>
                </div>
            </div>
        );
    }

    const monthlySummary = calculateMonthlySummary();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const currentMonthName = generateMonths().find(m => m.value === selectedMonth)?.fullLabel;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
            {/* Header Section */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                            <FaCalendarCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Monthly Work Tracker
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {currentMonthName} {selectedYear} • Track daily progress and task completion
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchAssignments}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="text-sm font-medium">Refresh</span>
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={exporting || assignments.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FiDownload className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
                            <span className="text-sm font-medium">
                                {exporting ? 'Exporting...' : 'Export Excel'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FiFilter className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Filters & Controls</h3>
                        </div>
                        {(selectedRole || selectedUserId || searchTerm) && (
                            <button
                                onClick={() => {
                                    setSelectedRole('');
                                    setSelectedUserId('');
                                    setSearchTerm('');
                                    setUsers([]);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Role Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                User Role
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiUser className="w-4 h-4 text-gray-400" />
                                </div>
                                <select
                                    value={selectedRole}
                                    onChange={handleRoleChange}
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
                                >
                                    <option value="">All Roles</option>
                                    <option value="staff">Staff</option>
                                    <option value="manager">Manager</option>
                                </select>
                            </div>
                        </div>

                        {/* User Filter */}
                        {selectedRole && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select User
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiUser className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={selectedUserId}
                                        onChange={handleUserChange}
                                        disabled={loadingUsers || users.length === 0}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">All {selectedRole === 'staff' ? 'Staff' : 'Managers'}</option>
                                        {users.map((user) => (
                                            <option key={user._id} value={user._id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Date Filters */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Month
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FiCalendar className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
                                    >
                                        {generateMonths().map((month) => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative flex-1">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full pl-4 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 appearance-none shadow-sm"
                                    >
                                        {generateYears().map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Tasks
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiSearch className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search tasks or users..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-sm placeholder-gray-400"
                                />
                            </div>
                        </div> */}
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="mb-6 md:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Completion Rate */}
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Completion Rate</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">
                                        {monthlySummary.completionRate}%
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        of {monthlySummary.totalWorkDays} days
                                    </span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full border-4 border-gray-100">
                                    <div
                                        className="absolute inset-0 rounded-full border-4 border-emerald-500"
                                        style={{
                                            clipPath: `inset(0 ${100 - monthlySummary.completionRate}% 0 0)`
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Completed Days */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg border border-emerald-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-emerald-600 mb-1">Completed Days</p>
                                <p className="text-3xl font-bold text-emerald-900">
                                    {monthlySummary.completedDays}
                                </p>
                                <p className="text-xs text-emerald-700 mt-1">
                                    All tasks finished for these days
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl">
                                <FiCheckCircle className="w-7 h-7 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    {/* In Progress Days */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg border border-blue-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">In Progress</p>
                                <p className="text-3xl font-bold text-blue-900">
                                    {monthlySummary.inProgressDays}
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Active work days
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                                <FiClock className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Pending Days */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border border-amber-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-600 mb-1">Pending Days</p>
                                <p className="text-3xl font-bold text-amber-900">
                                    {monthlySummary.pendingDays}
                                </p>
                                <p className="text-xs text-amber-700 mt-1">
                                    Scheduled but not started
                                </p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                                <FiClock className="w-7 h-7 text-amber-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Main Table */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="p-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Monthly Work Sheet</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Showing {Math.min(totalItems, startIndex + 1)}-{Math.min(totalItems, startIndex + currentItems.length)} of {totalItems} assignments
                                    </p>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FiChevronLeft className="w-5 h-5" />
                                        </button>
                                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <FiChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                    <tr>
                                        <th className="sticky left-0 z-20 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 w-12">
                                            #
                                        </th>
                                        <th className="sticky left-12 z-20 px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 min-w-[140px] w-[140px]">
                                            <div className="flex items-center gap-2">
                                                <FiUser className="w-4 h-4" />
                                                <span>Member</span>
                                            </div>
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider min-w-[200px] w-[200px]">
                                            <div className="flex items-center gap-2">
                                                <FiFileText className="w-4 h-4" />
                                                <span>Task</span>
                                            </div>
                                        </th>

                                        {/* Days Header */}
                                        {Array.from({ length: 31 }, (_, i) => (
                                            <th
                                                key={i}
                                                className={`px-0.5 py-2 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-7 min-w-[1.75rem] ${i + 1 > daysInMonth ? 'bg-gray-100' : ''}`}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[9px] text-gray-500">
                                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(selectedYear, selectedMonth - 1, i + 1).getDay()]}
                                                    </span>
                                                    <span className={`text-xs font-bold ${i + 1 > daysInMonth ? 'text-gray-400' : 'text-gray-700'}`}>
                                                        {i + 1}
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {currentItems.map((assignment, index) => (
                                        <tr key={assignment._id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Row Number */}
                                            <td className="sticky left-0 z-10 px-3 py-3 whitespace-nowrap text-xs font-medium text-gray-900 bg-white shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                                                <div className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-lg">
                                                    {startIndex + index + 1}
                                                </div>
                                            </td>

                                            {/* User */}
                                            <td className="sticky left-12 z-10 px-2 py-3 whitespace-nowrap bg-white overflow-hidden shadow-[1px_0_0_0_rgba(0,0,0,0.05)] w-[140px] max-w-[140px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-xs font-semibold shadow-md">
                                                            {assignment.assignedTo?.name?.charAt(0) || 'U'}
                                                        </div>
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-gray-900 truncate" title={assignment.assignedTo?.name}>
                                                            {assignment.assignedTo?.name || 'Unassigned'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Task Details */}
                                            <td className="px-2 py-3 overflow-hidden w-[200px] max-w-[200px]">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${assignment.priority === 'high'
                                                            ? 'bg-red-100 text-red-800'
                                                            : assignment.priority === 'medium'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                            {assignment.priority}
                                                        </span>
                                                        <h4 className="text-xs font-semibold text-gray-900 truncate flex-1" title={assignment.title}>
                                                            {assignment.title}
                                                        </h4>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-500 whitespace-nowrap">
                                                        <span>
                                                            {new Date(assignment.startDate).getDate()}/{new Date(assignment.startDate).getMonth() + 1}
                                                        </span>
                                                        <span className="text-gray-300">→</span>
                                                        <span>
                                                            {new Date(assignment.endDate).getDate()}/{new Date(assignment.endDate).getMonth() + 1}
                                                        </span>
                                                        <span className="ml-auto font-medium text-blue-600 ml-1">
                                                            {assignment.progress}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Daily Cells */}
                                            {Array.from({ length: 31 }).map((_, dayIndex) => {
                                                const day = dayIndex + 1;
                                                const isInvalidDay = day > daysInMonth;
                                                const statusDisplay = !isInvalidDay ? getWorkStatusDisplay(assignment._id, day) : null;
                                                const hasData = statusDisplay?.taskData;
                                                const isToday = day === new Date().getDate() &&
                                                    selectedMonth === new Date().getMonth() + 1 &&
                                                    selectedYear === new Date().getFullYear();

                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className={`p-0 text-center h-10 w-7 ${isInvalidDay ? 'bg-gray-50' : ''} ${isToday ? 'bg-blue-50/30' : ''}`}
                                                        onClick={() => !isInvalidDay && handleDayCellClick(assignment._id, day)}
                                                        onMouseEnter={(e) => !isInvalidDay && hasData && handleMouseEnter(e, statusDisplay)}
                                                        onMouseLeave={handleMouseLeave}
                                                    >
                                                        {!isInvalidDay && statusDisplay?.config && (
                                                            <div className="relative group w-full h-full flex items-center justify-center">
                                                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-transform duration-200 hover:scale-110 ${statusDisplay.config.color} shadow-sm`}>
                                                                    {statusDisplay.config.label}
                                                                </div>
                                                                {isToday && (
                                                                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan={34} className="px-4 py-12 text-center">
                                                <div className="max-w-md mx-auto">
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                        <FiAlertCircle className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                                        No Assignments Found
                                                    </h3>
                                                    <p className="text-gray-500 text-sm">
                                                        {searchTerm
                                                            ? `No assignments match "${searchTerm}" for ${selectedMonth}/${selectedYear}`
                                                            : `No assignments found for ${selectedMonth}/${selectedYear}`}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer */}
                        {totalPages > 1 && (
                            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{Math.min(totalItems, startIndex + 1)}</span> to{" "}
                                        <span className="font-semibold">{Math.min(totalItems, startIndex + currentItems.length)}</span> of{" "}
                                        <span className="font-semibold">{totalItems}</span> assignments
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-700 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Last
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Tooltip */}
            {tooltipData && tooltipData.data.taskData && (
                <div
                    className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-gray-300 p-5 pointer-events-none transform -translate-x-1/2 -translate-y-full w-96 max-h-[80vh] overflow-y-auto backdrop-blur-sm bg-white/95"
                    style={{
                        left: tooltipData.x,
                        top: tooltipData.y,
                        filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.1))'
                    }}
                >
                    {/* Tooltip arrow */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white border-r border-b border-gray-300"></div>

                    {/* Header */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">
                                    {tooltipData.data.taskData.taskTitle}
                                </h4>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${tooltipData.data.taskData.priority === 'high'
                                        ? 'bg-red-100 text-red-800'
                                        : tooltipData.data.taskData.priority === 'medium'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                        }`}>
                                        {tooltipData.data.taskData.priority}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${tooltipData.data.taskData.status === 'completed'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : tooltipData.data.taskData.status === 'in-progress'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-amber-100 text-amber-800'
                                        }`}>
                                        {tooltipData.data.taskData.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Progress</div>
                                <div className="text-lg font-bold text-blue-600">
                                    {tooltipData.data.taskData.progress || 0}%
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {tooltipData.data.taskData.taskDescription}
                        </p>
                    </div>

                    {/* Daily Progress Section */}
                    {tooltipData.data.progressData ? (
                        <div className="space-y-4">
                            {/* Stats Overview */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FiClock className="w-3 h-3 text-blue-600" />
                                        <span className="text-xs font-medium text-gray-700">Hours</span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {tooltipData.data.progressData.hoursLogged || 0}
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                                        <span className="text-xs font-medium text-gray-700">Subtasks</span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        {tooltipData.data.progressData.completedSubtasks || 0}/{tooltipData.data.progressData.totalSubtasks || 0}
                                    </div>
                                </div>
                            </div>

                            {/* Subtasks List */}
                            {tooltipData.data.progressData.subTasks && tooltipData.data.progressData.subTasks.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="text-sm font-semibold text-gray-800">Daily Subtasks</h5>
                                        <span className="text-xs text-gray-500">
                                            {tooltipData.data.progressData.subtaskCompletion || 0}% complete
                                        </span>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                        {tooltipData.data.progressData.subTasks.map((subTask, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                            >
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center ${subTask.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-600'
                                                    : subTask.status === 'in-progress'
                                                        ? 'bg-blue-100 text-blue-600'
                                                        : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {subTask.status === 'completed' ? '✓' : '●'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 mb-1">
                                                        {subTask.description}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        {subTask.hoursSpent > 0 && (
                                                            <span className="flex items-center gap-1">
                                                                <FiClock className="w-3 h-3" />
                                                                {subTask.hoursSpent}h
                                                            </span>
                                                        )}
                                                        <span className="capitalize">{subTask.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            {tooltipData.data.progressData.remarks && (
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiFileText className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">Remarks</span>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl italic">
                                        {tooltipData.data.progressData.remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <FiAlertCircle className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">No Progress Logged</p>
                            <p className="text-xs text-gray-500">No work has been recorded for this day</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MonthlyWorkingSheet;