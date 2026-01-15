import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile, changePassword } from '../store/slices/authSlice';
import { fetchCompanies } from '../store/slices/companySlice';
import toast from 'react-hot-toast';
import {
  UserCircleIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useEffect } from 'react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { companies } = useSelector((state) => state.companies);

  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCompanies())
  }, [dispatch]);

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }

    try {
      await dispatch(updateProfile(profileData)).unwrap();
      toast.success('Profile updated successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update profile', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap();

      toast.success('Password changed successfully!');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
    } catch (error) {
      toast.error('Failed to change password', error);
    }
  };

  const getCompanyName = () => {
    const company = companies.find(c => c._id === user?.company);
    return company ? company.name : 'Not assigned';
  };

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">My Profile</h1>
            <p className="text-gray-600 mt-2 text-lg">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className="inline-flex items-center px-4 py-2.5 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            {editMode ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Overview */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center ring-4 ring-white shadow-xl">
                  <UserCircleIcon className="h-16 w-16 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                {editMode ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all duration-200 font-medium"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-gray-900">{user?.name}</h2>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 bg-gray-50 w-fit px-4 py-2 rounded-lg mx-auto sm:mx-0">
                        <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span className="font-medium">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 bg-gray-50 w-fit px-4 py-2 rounded-lg mx-auto sm:mx-0">
                        <ShieldCheckIcon className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="capitalize font-medium">{user?.role}</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start text-gray-600 bg-gray-50 w-fit px-4 py-2 rounded-lg mx-auto sm:mx-0">
                        <BuildingOfficeIcon className="h-5 w-5 mr-3 text-gray-400" />
                        <span className="font-medium">{getCompanyName()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Security</h3>
                <p className="text-gray-500 mt-1">Update your password securely</p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md animate-fade-in-down">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, currentPassword: e.target.value });
                        if (errors.currentPassword) setErrors({ ...errors, currentPassword: '' });
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPasswords.current ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value });
                        if (errors.newPassword) setErrors({ ...errors, newPassword: '' });
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.newPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPasswords.new ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPasswords.confirm ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-md transition-all duration-200 font-medium"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setErrors({});
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;