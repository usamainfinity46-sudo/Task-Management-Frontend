import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
    FiCheckCircle,
    FiClock,
    FiCalendar,
    FiUser,
    FiFileText,
    FiAlertCircle,
    FiChevronDown
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
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
    const [selectedRole, setSelectedRole] = useState(''); // 'staff' or 'manager'
    const [selectedUserId, setSelectedUserId] = useState(''); // Selected user ID
    const [users, setUsers] = useState([]); // Users list based on role
    const [loadingUsers, setLoadingUsers] = useState(false);
    const itemsPerPage = 8;

    // Updated work status options
    const workStatusOptions = [
        { value: 'completed', label: '✓', color: 'bg-green-500', tooltip: 'Complete' },
        { value: 'in-progress', label: '●', color: 'bg-blue-500', tooltip: 'In Progress' },
        { value: 'pending', label: '○', color: 'bg-yellow-500', tooltip: 'Pending' },
        { value: 'not-started', label: '—', color: 'bg-gray-200', tooltip: 'Not Started' }
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

        // Reset times to compare only dates
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
    // IMPORTANT: Each day's status is calculated independently based ONLY on that day's work
    const getDayStatus = (task, day) => {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const currentDay = new Date(selectedYear, selectedMonth - 1, day);

        // Check if day is within task range
        if (!isDayInTaskRange(day, startDate, endDate)) {
            return 'not-started';
        }

        // Check for specific day progress - ONLY use this day's data
        const dayProgress = findDayProgress(task, day);

        if (dayProgress) {
            // Check if day has subtasks
            if (dayProgress.subTasks && dayProgress.subTasks.length > 0) {
                const allCompleted = dayProgress.subTasks.every(st => st.status === 'completed');
                const anyInProgress = dayProgress.subTasks.some(st =>
                    st.status === 'in-progress' || st.status === 'pending'
                );

                if (allCompleted) return 'completed';
                if (anyInProgress || dayProgress.subTasks.length > 0) return 'in-progress';
            }

            // Check for hours logged on THIS specific day
            const dayHours = dayProgress.subTasks?.reduce((sum, st) => sum + (st.hoursSpent || 0), 0) || 0;
            if (dayHours > 0) {
                return 'in-progress';
            }
        }

        // If no work done on this specific day, it's pending
        // DO NOT check overall task status - each day is independent
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

        // Calculate subtask stats
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

            // Calculate status for each day in the month
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
                        totalSubtasks: task.totalSubtasks
                    };

                    // Get daily progress details
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
            if (res.data && res.data.success && res.data.users) {
                setUsers(res.data.users);
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
        setSelectedUserId(''); // Reset user selection when role changes
        if (role) {
            fetchUsersByRole(role);
        } else {
            setUsers([]);
        }
    };

    // Handle user selection
    const handleUserChange = (e) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
    };

    // Fetch assignments
    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                month: selectedMonth,
                year: selectedYear
            };

            // Add role filter if selected
            if (selectedRole) {
                params.role = selectedRole;
            }

            // Add userId filter if a user is selected
            if (selectedUserId) {
                params.userId = selectedUserId;
            }

            const res = await taskService.getReport(params);

            if (res.data && res.data.success && res.data.report && res.data.report.detailed) {
                processData(res.data.report.detailed);
                console.log("API Response:", res.data);
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
    }, [selectedMonth, selectedYear, selectedUserId, selectedRole, processData]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // Fetch users when role is selected
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
            console.log(`Task ${taskId}, Day ${day}:`, { status, progress });

            if (progress) {
                toast.success(`Day ${day}: ${progress.hoursLogged} hours logged, ${progress.subTasks?.length || 0} subtasks`);
            } else {
                toast.info(`Day ${day}: ${status.status.toUpperCase()} - No progress logged yet`);
            }
        }
    };

    // Generate months for dropdown
    const generateMonths = () => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date(2000, i, 1);
            months.push({
                value: i + 1,
                label: date.toLocaleDateString('en-US', { month: 'long' })
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

                    // Add progress stats
                    const progress = dailyProgress[assignment._id]?.[parseInt(day)];
                    if (progress) {
                        totalHoursLogged += progress.hoursLogged || 0;
                        totalSubtasksCompleted += progress.completedSubtasks || 0;
                    }
                });
            }
        });

        return {
            totalWorkDays,
            completedDays,
            inProgressDays,
            pendingDays,
            totalHoursLogged,
            totalSubtasksCompleted
        };
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const monthlySummary = calculateMonthlySummary();
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    return (
        <div className="p-4 bg-gray-50 h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <FaCalendarCheck className="text-blue-600 w-6 h-6" />
                    <div>
                        <h1 className="text-xl font-bold text-blue-600">Monthly Working Sheet</h1>
                        <p className="text-gray-500 text-xs">Track daily work status and progress</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Role Filter Dropdown */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiUser className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="pl-12 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400 appearance-none min-w-[140px]"
                        >
                            <option value="">All Roles</option>
                            <option value="staff">Staff</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>

                    {/* User Filter Dropdown */}
                    {selectedRole && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FiUser className="w-5 h-5 text-gray-400" />
                            </div>
                            <select
                                value={selectedUserId}
                                onChange={handleUserChange}
                                disabled={loadingUsers || users.length === 0}
                                className="pl-12 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400 appearance-none min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">All {selectedRole === 'staff' ? 'Staff' : 'Managers'}</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {user.name} {user.email ? `(${user.email})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Year Selector */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiCalendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="pl-12 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400 appearance-none"
                        >
                            {generateYears().map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Selector */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FiCalendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="pl-12 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white transition-all duration-200 hover:border-gray-400 appearance-none"
                        >
                            {generateMonths().map((month) => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Filter Indicator */}
            {(selectedRole || selectedUserId) && (
                <div className="mb-3 flex-shrink-0">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiUser className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800 font-medium">
                                {selectedUserId
                                    ? `Showing data for: ${users.find(u => u._id === selectedUserId)?.name || 'Selected User'}`
                                    : selectedRole
                                        ? `Showing all ${selectedRole === 'staff' ? 'Staff' : 'Managers'}`
                                        : 'All Users'
                                }
                            </span>
                        </div>
                        {(selectedRole || selectedUserId) && (
                            <button
                                onClick={() => {
                                    setSelectedRole('');
                                    setSelectedUserId('');
                                    setUsers([]);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="mb-4 flex-shrink-0">
                <div className="grid grid-cols-4 gap-3">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-green-600 font-medium">Complete Days</div>
                                <div className="text-xl font-bold text-green-700">{monthlySummary.completedDays}</div>
                            </div>
                            <FiCheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-blue-600 font-medium">In Progress</div>
                                <div className="text-xl font-bold text-blue-700">{monthlySummary.inProgressDays}</div>
                            </div>
                            <FiClock className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-yellow-600 font-medium">Pending</div>
                                <div className="text-xl font-bold text-yellow-700">{monthlySummary.pendingDays}</div>
                            </div>
                            <FiClock className="w-6 h-6 text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Work Status Legend */}
            <div className="mb-4 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Work Status Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        {workStatusOptions.map((status) => (
                            <div key={status.value} className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold ${status.color}`}>
                                    {status.label}
                                </div>
                                <span className="text-sm text-gray-600">{status.tooltip}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        <p>• Hover over a day to see detailed progress information</p>
                    </div>
                </div>
            </div>

            {/* Monthly Working Sheet Table */}
            <div className="rounded-xl shadow-lg border border-gray-200 w-full bg-white flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase tracking-wider">
                                <th className="border border-gray-300 px-2 py-2 w-10 text-center font-semibold text-xs sticky left-0 z-20 bg-gray-50">
                                    SR.
                                </th>
                                <th className="border border-gray-300 px-3 py-2 w-32 text-left font-semibold text-xs sticky left-10 z-20 bg-gray-50">
                                    USER
                                </th>
                                <th className="border border-gray-300 px-3 py-2 min-w-[200px] text-left font-semibold text-xs">
                                    TASKS
                                </th>

                                {/* Days Header 1–31 (or days in month) */}
                                {Array.from({ length: 31 }, (_, i) => (
                                    <th
                                        key={i}
                                        className={`border border-gray-300 px-1 py-1 w-7 text-center font-semibold text-[10px] ${i + 1 > daysInMonth ? 'bg-gray-200' : ''}`}
                                    >
                                        {i + 1}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.map((assignment, index) => (
                                <tr key={assignment._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    {/* SR - Sticky */}
                                    <td className="border border-gray-300 px-2 py-2 text-center font-medium sticky left-0 z-10 bg-white">
                                        {startIndex + index + 1}
                                    </td>

                                    {/* User - Sticky */}
                                    <td className="border border-gray-300 px-3 py-2 sticky left-10 z-10 bg-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                <FiUser className="w-3 h-3" />
                                            </div>
                                            <span className="font-medium text-gray-900 truncate max-w-[100px]" title={assignment.assignedTo?.name}>
                                                {assignment.assignedTo?.name || 'Unassigned'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Task Info */}
                                    <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-gray-400 font-mono">#{assignment.taskId?.slice(-6)}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${assignment.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'}`}>
                                                {assignment.priority}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-700 text-sm font-medium block">
                                                {assignment.title}
                                            </span>
                                            <span className="text-gray-500 text-xs line-clamp-2">
                                                {assignment.description || 'No description'}
                                            </span>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                                <span>{new Date(assignment.startDate).toLocaleDateString()}</span>
                                                <span>→</span>
                                                <span>{new Date(assignment.endDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Daily Cells with Work Status */}
                                    {Array.from({ length: 31 }).map((_, dayIndex) => {
                                        const day = dayIndex + 1;
                                        const isInvalidDay = day > daysInMonth;
                                        const statusDisplay = !isInvalidDay ? getWorkStatusDisplay(assignment._id, day) : null;
                                        const hasData = statusDisplay?.taskData;

                                        return (
                                            <td
                                                key={dayIndex}
                                                className={`border border-gray-300 h-7 w-7 text-center group relative cursor-pointer ${isInvalidDay ? 'bg-gray-100' : ''}`}
                                                onClick={() => !isInvalidDay && handleDayCellClick(assignment._id, day)}
                                                onMouseEnter={(e) => !isInvalidDay && hasData && handleMouseEnter(e, statusDisplay)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                {!isInvalidDay && statusDisplay?.config && (
                                                    <div
                                                        className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all duration-200 hover:scale-110 ${statusDisplay.config.color}`}
                                                        title={`Day ${day}: ${statusDisplay.config.tooltip}`}
                                                    >
                                                        {statusDisplay.config.label}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {currentItems.length === 0 && (
                                <tr>
                                    <td colSpan={34} className="text-center py-8 text-gray-500">
                                        No assignments found for this month
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-3 border-t border-gray-200 flex-shrink-0 flex justify-between items-center bg-gray-50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-xs border rounded-lg disabled:opacity-50 hover:bg-white"
                        >
                            Previous
                        </button>
                        <span className="text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-xs border rounded-lg disabled:opacity-50 hover:bg-white"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Tooltip with Daily Progress */}
            {tooltipData && tooltipData.data.taskData && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 pointer-events-none transform -translate-x-1/2 -translate-y-full w-80 max-h-96 overflow-y-auto"
                    style={{ left: tooltipData.x, top: tooltipData.y }}
                >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>

                    {/* Task Header */}
                    <div className="mb-3 pb-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-800">{tooltipData.data.taskData.taskTitle}</p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tooltipData.data.taskData.taskDescription}</p>
                    </div>

                    {/* Overall Task Status */}
                    <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">Overall Task Status:</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tooltipData.data.taskData.status === 'completed' ? 'bg-green-100 text-green-800' :
                                tooltipData.data.taskData.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                                {tooltipData.data.taskData.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Progress: {tooltipData.data.taskData.progress || 0}%</span>
                            <span>Hours: {tooltipData.data.taskData.totalHours || 0}h</span>
                            <span>Subtasks: {tooltipData.data.taskData.completedSubtasks || 0}/{tooltipData.data.taskData.totalSubtasks || 0}</span>
                        </div>
                    </div>

                    {/* Daily Progress Section */}
                    {tooltipData.data.progressData ? (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FiCalendar className="w-3 h-3 text-blue-500" />
                                <span className="text-xs font-medium text-gray-700">Daily Progress</span>
                            </div>

                            {/* Hours Logged */}
                            {tooltipData.data.progressData.hoursLogged > 0 && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">Hours Logged:</span>
                                    <span className="text-xs font-medium text-blue-600">
                                        {tooltipData.data.progressData.hoursLogged} hours
                                    </span>
                                </div>
                            )}

                            {/* Subtasks */}
                            {tooltipData.data.progressData.subTasks && tooltipData.data.progressData.subTasks.length > 0 && (
                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-500">Subtasks Completed:</span>
                                        <span className="text-xs font-medium text-green-600">
                                            {tooltipData.data.progressData.completedSubtasks || 0}/{tooltipData.data.progressData.totalSubtasks || 0}
                                        </span>
                                    </div>
                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                        {tooltipData.data.progressData.subTasks.map((subTask, idx) => (
                                            <div key={idx} className="flex items-start gap-2">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${subTask.status === 'completed' ? 'bg-green-500' :
                                                    subTask.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                                                    }`} />
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-700 line-clamp-2">{subTask.description}</p>
                                                    {subTask.hoursSpent > 0 && (
                                                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <FiClock className="w-2.5 h-2.5" />
                                                            {subTask.hoursSpent} hours
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Remarks */}
                            {tooltipData.data.progressData.remarks && (
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="flex items-center gap-1 mb-1">
                                        <FiFileText className="w-3 h-3 text-gray-400" />
                                        <span className="text-xs text-gray-500">Remarks:</span>
                                    </div>
                                    <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                                        {tooltipData.data.progressData.remarks}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* No Daily Progress Message */
                        <div className="flex items-center gap-2 text-gray-400">
                            <FiAlertCircle className="w-4 h-4" />
                            <span className="text-xs">No progress logged for this day</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MonthlyWorkingSheet;