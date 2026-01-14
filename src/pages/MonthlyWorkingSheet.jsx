import React, { useState, useEffect, useCallback } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
    FiCheckCircle,
    FiClock,
    FiCalendar,
    FiUser,
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
import { taskService } from "../services/tasks";
import toast from "react-hot-toast";

const MonthlyWorkingSheet = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [workStatus, setWorkStatus] = useState({});
    const itemsPerPage = 8; // Reduced to fit screen vertically

    // Simplified work status options
    const workStatusOptions = [
        { value: 'completed', label: '✓', color: 'bg-green-500', tooltip: 'Complete' },
        { value: 'in-progress', label: '◐', color: 'bg-blue-500', tooltip: 'In Progress' },
        { value: 'pending', label: '!', color: 'bg-gray-300', tooltip: 'Pending' }
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

    // Process API data into UI format
    const processData = useCallback((tasks) => {
        const status = {};

        tasks.forEach(task => {
            status[task._id] = {};

            if (task.days && Array.isArray(task.days)) {
                task.days.forEach(day => {
                    const date = new Date(day.date);
                    const dayNum = date.getDate();

                    // Determine day status based on subtasks
                    let dayStatus = null;
                    const subTasks = day.subTasks || [];

                    if (subTasks.length > 0) {
                        const hasInProgress = subTasks.some(st => st.status === 'in-progress' || st.status === 'pending');
                        const allCompleted = subTasks.every(st => st.status === 'completed');

                        if (allCompleted) dayStatus = 'completed';
                        else if (hasInProgress) dayStatus = 'in-progress';
                        else dayStatus = 'completed';
                    }

                    if (dayStatus) {
                        if (dayStatus) {
                            status[task._id][dayNum] = {
                                status: dayStatus,
                                subTasks: subTasks
                            };
                        }
                    }
                });
            }
        });

        setWorkStatus(status);
        setAssignments(tasks);
    }, []);

    // Fetch assignments
    const fetchAssignments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await taskService.getReport({
                month: selectedMonth,
                year: selectedYear
            });

            if (res.data && res.data.success && res.data.report && res.data.report.detailed) {
                processData(res.data.report.detailed);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            console.error("Failed to fetch monthly report", error);
            toast.error("Failed to load monthly data");
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    }, [selectedMonth, selectedYear, processData]);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    // Pagination calculations
    const totalItems = assignments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = assignments.slice(startIndex, startIndex + itemsPerPage);



    // Get work status display for a cell
    const getWorkStatusDisplay = (assignmentId, day) => {
        const data = workStatus[assignmentId]?.[day];
        if (!data) return null;
        const statusConfig = workStatusOptions.find(opt => opt.value === data.status);
        return { config: statusConfig, subTasks: data.subTasks };
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

        assignments.forEach(assignment => {
            if (workStatus[assignment._id]) {
                Object.values(workStatus[assignment._id]).forEach(status => {
                    totalWorkDays++;
                    if (status.status === 'completed') completedDays++;
                    if (status.status === 'in-progress') inProgressDays++;
                });
            }
        });

        return { totalWorkDays, completedDays, inProgressDays };
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
            {/* Removed CommanHeader as it is not present in codebase. Layout header will be used. */}

            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <FaCalendarCheck className="text-blue-600 w-6 h-6" />
                    <div>
                        <h1 className="text-xl font-bold text-blue-600">Monthly Working Sheet</h1>
                        <p className="text-gray-500 text-xs">Track daily work status for assignments</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
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

            {/* Summary Stats */}
            <div className="mb-4 flex-shrink-0">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-green-600 font-medium">Complete Tasks</div>
                                <div className="text-xl font-bold text-green-700">{monthlySummary.completedDays}</div>
                            </div>
                            <FiCheckCircle className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-blue-600 font-medium">In Progress Tasks</div>
                                <div className="text-xl font-bold text-blue-700">{monthlySummary.inProgressDays}</div>
                            </div>
                            <FiClock className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Work Status Legend */}
            <div className="mb-4 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <h3 className="text-xs font-semibold text-gray-700 mb-2">Work Status</h3>
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
                </div>
            </div>

            {/* Monthly Working Sheet Table */}
            <div className="rounded-xl shadow-lg border border-gray-200 w-full bg-white flex-1 flex flex-col min-h-0 overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full border-collapse text-xs">
                        <thead className="sticky top-0 z-10 bg-white">
                            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 uppercase tracking-wider">
                                {/* Fixed Headers */}
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

                                    {/* Tasks (Subtasks or Description) */}
                                    <td className="border border-gray-300 px-3 py-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-gray-400 font-mono">#{assignment.title}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-gray-700 text-sm font-medium block whitespace-nowrap">
                                                {assignment.description || 'No description'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Daily Cells with Work Status */}
                                    {Array.from({ length: 31 }).map((_, dayIndex) => {
                                        const day = dayIndex + 1;
                                        const isInvalidDay = day > daysInMonth;
                                        const statusConfig = !isInvalidDay ? getWorkStatusDisplay(assignment._id, day) : null;

                                        return (
                                            <td
                                                key={dayIndex}
                                                className={`border border-gray-300 h-7 w-7 text-center group relative cursor-pointer ${isInvalidDay ? 'bg-gray-100' : ''}`}
                                                onClick={() => !isInvalidDay && handleDayCellClick(assignment._id, day)}
                                                onMouseEnter={(e) => !isInvalidDay && statusConfig && handleMouseEnter(e, statusConfig)}
                                                onMouseLeave={handleMouseLeave}
                                            >
                                                {statusConfig && statusConfig.config && (
                                                    <div
                                                        className={`w-5 h-5 mx-auto rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all duration-200 hover:scale-110 ${statusConfig.config.color}`}
                                                    >
                                                        {statusConfig.config.label}
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

            {/* Floating Tooltip */}
            {tooltipData && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-4 pointer-events-none transform -translate-x-1/2 -translate-y-full w-64"
                    style={{ left: tooltipData.x, top: tooltipData.y }}
                >
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-gray-200"></div>
                    <div className="space-y-3">
                        {tooltipData.data.subTasks.map((subTask, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-left">
                                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${subTask.status === 'completed' ? 'bg-green-500' :
                                    subTask.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                                    }`} />
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 line-clamp-2">{subTask.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {subTask.hoursSpent || 0} hrs
                                        </span>
                                        {subTask.remarks && (
                                            <span className="text-[10px] text-gray-400 italic bg-gray-50 px-1 rounded">
                                                {subTask.remarks}
                                            </span>
                                        )}
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

export default MonthlyWorkingSheet;
