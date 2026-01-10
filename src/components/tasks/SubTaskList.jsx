// components/tasks/SubTaskList.jsx
import React, { useState } from 'react';
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
import { TASK_STATUS } from '../../utils/constants'; // Add this import

const SubTaskList = ({
    subTasks,
    taskId,
    onUpdateSubTask,
    onDeleteSubTask,
    canEdit,
    onAddSubTask
}) => {
    const [expandedTasks, setExpandedTasks] = useState({});
    const [editingSubTask, setEditingSubTask] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const sortSubtasksByDate = (subTasks) => {
        // console.log("subtask ", subTasks);
        // console.log("subtask ", subTasks);

        if (!subTasks || !Array.isArray(subTasks)) return [];
        return [...subTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    const sortedSubTasks = sortSubtasksByDate(subTasks);
    const filteredSubTasks = sortedSubTasks.filter(subTask => subTask.status !== 'completed');

    const toggleTaskExpansion = (taskId) => {
        setExpandedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
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
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
                {status}
            </span>
        );
    };

    const handleStatusChange = (subTaskId, newStatus) => {
        if (onUpdateSubTask) {
            // Call the update function but don't wait for it
            onUpdateSubTask(taskId, subTaskId, { status: newStatus });

            // Immediately reload the page
            window.location.reload();
        }
    };

    const handleEditClick = (subTask) => {
        setEditingSubTask(subTask);
        setShowEditModal(true);
    };

    const handleDeleteClick = (subTaskId) => {
        if (window.confirm('Are you sure you want to delete this subtask?')) {
            onDeleteSubTask(taskId, subTaskId);
        }
    };

    const handleUpdateSubTask = async (subTaskData) => {
        if (onUpdateSubTask && editingSubTask) {
            await onUpdateSubTask(taskId, editingSubTask._id, subTaskData);
            setShowEditModal(false);
            setEditingSubTask(null);
            window.location.reload();
        }
    };

    const handleAddNewSubTask = async (subTaskData) => {
        if (onAddSubTask) {
            await onAddSubTask(taskId, subTaskData);
            setShowAddModal(false);
            window.location.reload(); // This will refresh the entire page
        }
    };

    return (
        <>
            <div className="mt-4 border rounded-lg">
                {/* Header */}
                <div
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-t-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleTaskExpansion(taskId)}
                >
                    <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">
                            Daily Subtasks ({filteredSubTasks.length})
                        </span>
                        <span className="text-xs text-gray-500">
                            {sortedSubTasks.filter(st => st.status === 'completed').length} completed
                        </span>
                    </div>
                    <div className="flex items-center space-x-3">
                        {canEdit && (
                            <button
                                className="inline-flex items-center p-1 text-green-600 hover:text-green-800"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddModal(true);
                                }}
                                title="Add Subtask"
                            >
                                <span className="text-sm font-medium">+ Add</span>
                            </button>
                        )}
                        {expandedTasks[taskId] ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                        ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                        )}
                    </div>
                </div>

                {/* Expanded Content */}
                {expandedTasks[taskId] && (
                    <div className="p-4 space-y-4">
                        {sortedSubTasks.map((subTask, index) => (
                            <div key={subTask._id} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => handleStatusChange(
                                                        subTask._id,
                                                        subTask.status === 'completed' ? 'pending' : 'completed'
                                                    )}
                                                    className="flex items-center"
                                                >
                                                    {getStatusIcon(subTask.status)}
                                                </button>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        Day {index + 1} • {format(new Date(subTask.date), 'EEEE, MMMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {canEdit && (
                                                    <select
                                                        value={subTask.status}
                                                        onChange={(e) => handleStatusChange(subTask._id, e.target.value)}
                                                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        {Object.entries(TASK_STATUS).map(([key, value]) => (
                                                            <option key={key} value={value}>
                                                                {value}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                {getStatusBadge(subTask.status)}
                                            </div>
                                        </div>

                                        <div className="mt-3 space-y-2">
                                            {/* Hours Spent */}
                                            {subTask.hoursSpent > 0 && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <span className="font-medium">Hours spent:</span>
                                                    <span>{subTask.hoursSpent} hours</span>
                                                </div>
                                            )}

                                            {/* Remarks */}
                                            {subTask.remarks && (
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">Remarks:</span>
                                                    <span className="ml-2">{subTask.remarks}</span>
                                                </div>
                                            )}

                                            {/* Completed At */}
                                            {subTask.completedAt && (
                                                <div className="text-xs text-gray-500">
                                                    Completed: {format(new Date(subTask.completedAt), 'MMM dd, hh:mm a')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {canEdit && (
                                        <div className="flex flex-col space-y-2 ml-4">
                                            <button
                                                onClick={() => handleEditClick(subTask)}
                                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Edit Subtask"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(subTask._id)}
                                                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

            {/* Edit Subtask Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingSubTask(null);
                }}
                title="Edit Daily Task"
            >
                {editingSubTask && (
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
                title="Add Daily Task"
            >
                <SubTaskForm
                    onSubmit={handleAddNewSubTask}
                    onCancel={() => setShowAddModal(false)}
                    task={{ startDate: new Date(), endDate: new Date() }}
                />
            </Modal>
        </>
    );
};

export default SubTaskList;