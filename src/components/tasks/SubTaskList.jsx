// components/tasks/SubTaskList.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    PencilIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import SubTaskForm from './SubTaskForm';
import Modal from '../common/Modal';
import { TASK_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const SubTaskList = ({
    days = [],
    taskId,
    onUpdateSubTask,
    onDeleteSubTask,
    canEdit,
    onAddSubTask
}) => {
    const [expandedDays, setExpandedDays] = useState({});
    const [editingSubTask, setEditingSubTask] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [isManager, setIsManager] = useState(false);
    const [loadingRole, setLoadingRole] = useState(true);

    // Get user role from localStorage
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
        setIsManager(role === 'manager');
        setLoadingRole(false);
    }, []);

    // Sort days by date
    const sortedDays = [...days].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
    );

    // Calculate total subtasks across all days
    const totalSubTasks = days.reduce((sum, day) =>
        sum + (day.subTasks?.length || 0), 0
    );

    const completedSubTasks = days.reduce((sum, day) =>
        sum + (day.subTasks?.filter(st => st.status === 'completed').length || 0), 0
    );

    const toggleDayExpansion = (dayDate) => {
        setExpandedDays(prev => ({
            ...prev,
            [dayDate]: !prev[dayDate]
        }));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'in-progress':
                return <ClockIcon className="h-5 w-5 text-blue-500" />;
            case 'delayed':
                return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <ClockIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            delayed: 'bg-red-100 text-red-800'
        };

        const formatStatus = (str) => {
            return str.split('-').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
                {formatStatus(status)}
            </span>
        );
    };



    const handleEditClick = (subTask) => {
        if (!isManager) {
            setEditingSubTask(subTask);
            setShowEditModal(true);
        }
    };



    const handleDeleteClick = async (subTaskId) => {
        if (!isManager && onDeleteSubTask) {
            onDeleteSubTask(taskId, subTaskId);
        }
    };


    const handleUpdateSubTask = async (subTaskData) => {
        if (onUpdateSubTask && editingSubTask && !isManager) {
            try {
                const payload = {
                    status: subTaskData.status,
                    hoursSpent: subTaskData.hoursSpent || 0,
                    remarks: subTaskData.remarks || '',
                    description: subTaskData.description
                };

                await onUpdateSubTask(taskId, editingSubTask._id, payload);
                setShowEditModal(false);
                setEditingSubTask(null);
                window.location.reload(); // Reload after update
            } catch (error) {
                console.error('Failed to update subtask:', error);
                alert('Failed to update subtask. Please try again.');
            }
        }
    };

    const handleAddNewSubTask = async (subTaskData) => {
        if (onAddSubTask && !isManager) {
            try {
                const payload = {
                    date: subTaskData.date,
                    description: subTaskData.description,
                    status: subTaskData.status || 'in-progress',
                    hoursSpent: subTaskData.hoursSpent || 0,
                    remarks: subTaskData.remarks || ''
                };

                await onAddSubTask(taskId, payload);
                setShowAddModal(false);
                window.location.reload(); // Reload after add
            } catch (error) {
                console.error('Failed to add subtask:', error);
                alert('Failed to add subtask. Please try again.');
            }
        }
    };

    const canPerformActions = (userRole === 'staff' || userRole === 'admin') && !isManager;

    if (loadingRole) {
        return <div className="text-center py-4">Loading...</div>;
    }

    return (
        <>
            <div className="mt-4 border rounded-lg">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg">
                    <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                            Daily Subtasks ({totalSubTasks})
                        </span>
                        <span className="text-xs text-gray-500">
                            {completedSubTasks} completed
                        </span>
                    </div>
                    {canPerformActions && (
                        <button
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                            onClick={() => setShowAddModal(true)}
                            title="Add Subtask"
                        >
                            + Add Progress
                        </button>
                    )}
                </div>

                {/* Days List - Tree Structure */}
                <div className="divide-y">
                    {sortedDays.map((day) => {
                        const dayKey = day.date;
                        const isExpanded = expandedDays[dayKey];
                        const daySubTasks = day.subTasks || [];
                        const dayCompleted = daySubTasks.filter(st => st.status === 'completed').length;

                        return (
                            <div key={dayKey} className="bg-white">
                                {/* Day Header */}
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleDayExpansion(dayKey)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {isExpanded ? (
                                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                        )}
                                        <div>
                                            <span className="font-medium text-gray-900">
                                                {format(new Date(day.date), 'EEEE, MMMM dd, yyyy')}
                                            </span>
                                            <span className="ml-2 text-sm text-gray-500">
                                                ({daySubTasks.length} task{daySubTasks.length !== 1 ? 's' : ''})
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {dayCompleted}/{daySubTasks.length} completed
                                    </div>
                                </div>

                                {/* SubTasks for this Day */}
                                {isExpanded && (
                                    <div className="pl-8 pr-4 pb-3 space-y-2">
                                        {daySubTasks.map((subTask) => (
                                            <div
                                                key={subTask._id}
                                                className="border rounded-lg p-3 hover:bg-gray-50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center space-x-3">
                                                                <button

                                                                    disabled={isManager}
                                                                    className={isManager ? 'cursor-not-allowed opacity-50' : ''}
                                                                >
                                                                    {getStatusIcon(subTask.status)}
                                                                </button>
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-900">
                                                                        {subTask.description}
                                                                    </span>
                                                                </div>
                                                                {getStatusBadge(subTask.status)}
                                                            </div>
                                                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                                                                {subTask.hoursSpent > 0 && (
                                                                    <span className="font-medium">
                                                                        Hours Spent: {subTask?.hoursSpent || 0}
                                                                    </span>

                                                                )}
                                                                {subTask.createdAt && (
                                                                    <span>
                                                                        {format(new Date(subTask.createdAt), 'hh:mm a')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="ml-8 space-y-1">
                                                            {subTask.remarks && (
                                                                <div className="text-xs text-gray-600">
                                                                    <span className="font-medium">Remarks:</span> {subTask.remarks}
                                                                </div>
                                                            )}
                                                            {subTask.completedAt && (
                                                                <div className="text-xs text-gray-500">
                                                                    Completed: {format(new Date(subTask.completedAt), 'MMM dd, hh:mm a')}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {canPerformActions && (
                                                        <div className="flex items-center space-x-2 ml-4">

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditClick(subTask);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-blue-600"
                                                                title="Edit Subtask"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(subTask._id);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-red-600"
                                                                title="Delete Subtask"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {sortedDays.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            No subtasks yet. {canPerformActions && 'Click "Add Subtask" to create one.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Subtask Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingSubTask(null);
                }}
                title="Edit Daily Task"
            >
                {editingSubTask && canPerformActions && (
                    <SubTaskForm
                        onSubmit={handleUpdateSubTask}
                        onCancel={() => {
                            setShowEditModal(false);
                            setEditingSubTask(null);
                        }}
                        task={{ startDate: new Date(), endDate: new Date() }}
                        initialData={{
                            date: editingSubTask.date ? new Date(editingSubTask.date).toISOString().split('T')[0] : '',
                            description: editingSubTask.description,
                            hoursSpent: editingSubTask.hoursSpent || 0,
                            remarks: editingSubTask.remarks || '',
                            status: editingSubTask.status
                        }}
                    />
                )}
            </Modal>

            {/* Add Subtask Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Daily Progress"
            >
                {canPerformActions && (
                    <SubTaskForm
                        onSubmit={handleAddNewSubTask}
                        onCancel={() => setShowAddModal(false)}
                        task={{ startDate: new Date(), endDate: new Date() }}
                    />
                )}
            </Modal>
        </>
    );
};

export default SubTaskList;