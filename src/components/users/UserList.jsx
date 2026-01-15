import React from 'react';
import { format } from 'date-fns';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const UserList = ({ users, currentUser, onEdit, onDelete, companies }) => {
  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800'
    };

    const icons = {
      admin: <ShieldCheckIcon className="h-4 w-4" />,
      manager: <Cog6ToothIcon className="h-4 w-4" />,
      staff: <UserIcon className="h-4 w-4" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {icons[role]}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    );
  };



  // console.log("Users .... ", users);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user._id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {user.profileImage ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.profileImage}
                      alt={user.name}
                    />
                  ) : (
                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Company: {user?.company?.name}</span>
                    {user.manager && (
                      <span>Manager: {user.manager.name}</span>
                    )}
                    <span>Joined: {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded ${user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>

                {currentUser.role === 'admin' && (
                  <>
                    <button
                      onClick={() => onEdit && onEdit(user)}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Edit User"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(user._id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Delete User"
                      disabled={user._id === currentUser.id}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {users.length === 0 && (
        <div className="text-center py-12">
          <UserCircleIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new user.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserList;