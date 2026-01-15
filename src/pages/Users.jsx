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
    <div className="min-h-screen space-y-8 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">User Management</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage team members and their permissions
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {/* Search icon can go here if needed, currently empty div in original */}
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200"
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