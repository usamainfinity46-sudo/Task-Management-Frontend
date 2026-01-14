import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/userSlice';
import { fetchCompanies } from '../store/slices/companySlice';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Users = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { companies } = useSelector((state) => state.companies);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchCompanies())
  }, [dispatch]);

  // console.log("companies frooo ", companies);

  const filteredUsers = users.filter(user =>
    user.role !== 'admin' &&
    (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );


  const handleCreateUser = async (userData) => {
    try {
      await dispatch(createUser(userData)).unwrap();
      toast.success('User created successfully!');
      setShowCreateModal(false);
    } catch (error) {
      toast.error(error || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await dispatch(updateUser({ userId, userData })).unwrap();
      toast.success('User updated successfully!');
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to update user', error);
    }
  };

  const handleDeleteClick = (userId) => {
    setDeleteId(userId);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteUser(deleteId)).unwrap();
        toast.success('User deleted successfully!');
        setDeleteId(null);
      } catch (error) {
        toast.error('Failed to delete user', error);
      }
    }
  };

  const canManageUsers = currentUser?.role === 'admin' || currentUser?.role === 'manager';

  if (!canManageUsers) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 font-semibold">Access Denied</div>
        <p className="text-gray-600 mt-2">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage team members and their permissions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* Search icon */}
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* User List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <UserList
          users={filteredUsers}
          currentUser={currentUser}
          onEdit={setEditingUser}
          onDelete={handleDeleteClick}
          companies={companies}
        />
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New User"
      >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          companies={companies}
          currentUser={currentUser}
        />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        <UserForm
          user={editingUser}
          onSubmit={(userData) => handleUpdateUser(editingUser._id, userData)}
          onCancel={() => setEditingUser(null)}
          companies={companies}
          currentUser={currentUser}
        />
      </Modal>

      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        confirmText="Delete"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Users;