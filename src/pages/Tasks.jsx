// pages/Tasks.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  updateSubTask,
  deleteSubTask,
  addSubTask
} from '../store/slices/taskSlice';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PlusIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading, totalPages, currentPage } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  const [initialTaskData, setInitialTaskData] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    type: 'task',
    id: null,
    subTaskId: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  // Handle Create Task
  const handleCreateTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      await dispatch(createTask(taskData)).unwrap();
      toast.success('Task created successfully!', {
        duration: 3000,
      });
      
      // Smooth close with delay for better UX
      setTimeout(() => {
        setShowCreateModal(false);
        setInitialTaskData(null);
        setIsSubmitting(false);
      }, 100);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error || 'Failed to create task');
    }
  };

  // Handle Edit Task
  const handleEditTask = async (taskData) => {
    setIsSubmitting(true);
    try {
      await dispatch(updateTask({
        taskId: taskData._id,
        taskData
      })).unwrap();
      toast.success('Task updated successfully!', {
        duration: 3000,
        icon: '✅',
      });
      
      setTimeout(() => {
        setShowCreateModal(false);
        setInitialTaskData(null);
        setIsSubmitting(false);
      }, 100);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error || 'Failed to update task');
    }
  };

  // Handle Delete Task Click
  const handleDeleteTaskClick = (taskId) => {
    setDeleteConfirmation({ isOpen: true, type: 'task', id: taskId });
  };

  // Handle Delete SubTask Click
  const handleDeleteSubTaskClick = (taskId, subTaskId) => {
    setDeleteConfirmation({ isOpen: true, type: 'subtask', id: taskId, subTaskId });
  };

  // Generic Confirm Delete Handler
  const handleConfirmDelete = async () => {
    const { type, id, subTaskId } = deleteConfirmation;
    try {
      if (type === 'task') {
        await dispatch(deleteTask(id)).unwrap();
        toast.success('Task deleted successfully!', {
          duration: 3000,
          icon: '🗑️',
        });
      } else {
        await dispatch(deleteSubTask({ taskId: id, subTaskId })).unwrap();
        toast.success('Subtask deleted successfully!', {
          duration: 3000,
          icon: '🗑️',
        });
      }
      setDeleteConfirmation({ isOpen: false, type: 'task', id: null, subTaskId: null });
    } catch (error) {
      toast.error(error || `Failed to delete ${type}`);
    }
  };

  // Handle Update Subtask
  const handleUpdateSubTask = async (taskId, subTaskId, subTaskData) => {
    try {
      await dispatch(updateSubTask({ taskId, subTaskId, subTaskData })).unwrap();
      toast.success('Subtask updated successfully!', {
        duration: 2000,
        icon: '✨',
      });
    } catch (error) {
      toast.error(error || 'Failed to update subtask');
    }
  };

  // Handle Add Subtask
  const handleAddSubTask = async (taskId, subTaskData) => {
    try {
      await dispatch(addSubTask({
        taskId,
        subTaskData
      })).unwrap();
      toast.success('Subtask added successfully!', {
        duration: 2000,
        icon: '➕',
      });
    } catch (error) {
      console.error('Failed to add subtask:', error);
      toast.error('Failed to add subtask');
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (taskId, status) => {
    try {
      await dispatch(updateTaskStatus({ taskId, status })).unwrap();
      toast.success('Task status updated!', {
        duration: 2000,
        icon: '🔄',
      });
    } catch (error) {
      toast.error('Failed to update task status', error);
    }
  };

  // Handle Edit Button Click
  const handleEditClick = (task) => {
    setInitialTaskData({
      _id: task._id,
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo?._id || '',
      company: task.company?._id || '',
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'medium',
      status: task.status || 'pending'
    });
    setShowCreateModal(true);
  };

  const canCreateTask = user?.role !== 'staff';

  // Count active filters
  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => value && key !== 'page' && key !== 'limit'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Enhanced with animations */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
              Tasks
            </h1>
            <p className="text-gray-600 mt-2 text-base flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              Manage and track all tasks in your organization
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Enhanced Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative inline-flex items-center px-5 py-2.5 border rounded-xl shadow-md text-sm font-semibold transition-all duration-300 group
                ${showFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-blue-200' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
            >
              {showFilters ? (
                <XMarkIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90 duration-300" />
              ) : (
                <FunnelIcon className="h-5 w-5 mr-2 transition-transform group-hover:scale-110 duration-300" />
              )}
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shadow-lg animate-bounce">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Enhanced Create Button */}
            {canCreateTask && (
              <button
                onClick={() => {
                  setInitialTaskData(null);
                  setShowCreateModal(true);
                }}
                className="group relative inline-flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                <PlusIcon className="h-5 w-5 mr-2 transition-transform group-hover:rotate-90 duration-300" />
                New Task
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-down">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <FunnelIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Filter Tasks</h3>
                    <p className="text-xs text-gray-600">Refine your task view</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <TaskFilters
                filters={filters}
                onChange={handleFilterChange}
                onClear={() =>
                  setFilters({
                    status: '',
                    priority: '',
                    assignedTo: '',
                    startDate: '',
                    endDate: '',
                    page: 1,
                    limit: 10
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Task List with Skeleton Loading */}
        {isLoading ? (
          <TaskListSkeleton />
        ) : (
          <div className="animate-fade-in">
            <TaskList
              tasks={tasks}
              onUpdateStatus={handleUpdateStatus}
              onUpdateSubTask={handleUpdateSubTask}
              onDeleteSubTask={handleDeleteSubTaskClick}
              onAddSubTask={handleAddSubTask}
              onEdit={handleEditClick}
              onDelete={handleDeleteTaskClick}
              userRole={user?.role}
              currentUserId={user?._id}
            />
          </div>
        )}

        {/* Enhanced Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 px-6 py-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-bold text-blue-600">{(currentPage - 1) * filters.limit + 1}</span> to{' '}
                    <span className="font-bold text-blue-600">
                      {Math.min(currentPage * filters.limit, tasks.length)}
                    </span>{' '}
                    of <span className="font-bold text-gray-900">{tasks.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-semibold first:rounded-l-xl last:rounded-r-xl transition-all duration-200 ${
                          currentPage === i + 1
                            ? 'z-10 bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowCreateModal(false);
            setInitialTaskData(null);
          }
        }}
        title={initialTaskData ? '✏️ Edit Task' : '✨ Create New Task'}
      >
        <TaskForm
          initialData={initialTaskData}
          onSubmit={initialTaskData ? handleEditTask : handleCreateTask}
          onCancel={() => {
            setShowCreateModal(false);
            setInitialTaskData(null);
          }}
          userRole={user?.role}
          companyId={user?.company}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmation.type === 'task' ? 'Delete Task' : 'Delete Subtask'}
        message={`Are you sure you want to delete this ${deleteConfirmation.type}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

// Skeleton Component for Loading State
const TaskListSkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg w-1/2"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Status badges */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full"></div>
            <div className="h-6 w-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Tasks;