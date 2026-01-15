// pages/Tasks.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  updateSubTask,    // Add this
  deleteSubTask,    // Add this
  addSubTask       // Keep this
} from '../store/slices/taskSlice';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import TaskFilters from '../components/tasks/TaskFilters';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
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
    try {
      await dispatch(createTask(taskData)).unwrap();
      toast.success('Task created successfully!');
      setShowCreateModal(false);
      setInitialTaskData(null);
    } catch (error) {
      toast.error(error || 'Failed to create task');
    }
  };

  // Handle Edit Task
  const handleEditTask = async (taskData) => {
    try {
      await dispatch(updateTask({
        taskId: taskData._id,
        taskData
      })).unwrap();
      toast.success('Task updated successfully!');
      setShowCreateModal(false);
      setInitialTaskData(null);
    } catch (error) {
      toast.error(error || 'Failed to update task');
    }
  };

  // Handle Delete Task
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
        toast.success('Task deleted successfully!');
      } else {
        await dispatch(deleteSubTask({ taskId: id, subTaskId })).unwrap();
        toast.success('Subtask deleted successfully!');
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
      toast.success('Subtask updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update subtask');
    }
  };

  // Handle Delete Subtask


  // Handle Add Subtask (from SubTaskList component)
  const handleAddSubTask = async (taskId, subTaskData) => {
    try {
      // Dispatch the action with correct parameters
      await dispatch(addSubTask({
        taskId,
        subTaskData // This contains: date, description, status, hoursSpent, remarks
      })).unwrap();

      // Refresh tasks
      // dispatch(getTasks());
    } catch (error) {
      console.error('Failed to add subtask:', error);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async (taskId, status) => {
    try {
      await dispatch(updateTaskStatus({ taskId, status })).unwrap();
      toast.success('Task status updated!');
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

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Tasks</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage and track all tasks in your organization
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
          >
            <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
            Filters
          </button>

          {canCreateTask && (
            <button
              onClick={() => {
                setInitialTaskData(null);
                setShowCreateModal(true);
              }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 animate-fade-in-down">
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
      )}

      {/* Task List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * filters.limit + 1}</span> to{' '}
                    <span className="font-semibold text-gray-900">
                      {Math.min(currentPage * filters.limit, tasks.length)}
                    </span>{' '}
                    of <span className="font-semibold text-gray-900">{tasks.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium first:rounded-l-xl last:rounded-r-xl ${currentPage === i + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setInitialTaskData(null);
        }}
        title={initialTaskData ? 'Edit Task' : 'Create New Task'}
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
        />
      </Modal>

      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ ...deleteConfirmation, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteConfirmation.type === 'task' ? 'Delete Task' : 'Delete Subtask'}
        message={`Are you sure you want to delete this ${deleteConfirmation.type}?`}
        confirmText="Delete"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Tasks;