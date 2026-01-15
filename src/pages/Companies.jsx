import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from '../store/slices/companySlice';
import CompanyList from '../components/companies/CompanyList';
import CompanyForm from '../components/companies/CompanyForm';
import Modal from '../components/common/Modal';
import ConfirmationDialog from '../components/common/ConfirmationDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Companies = () => {
  const dispatch = useDispatch();
  const { companies, isLoading } = useSelector((state) => state.companies);
  const { user } = useSelector((state) => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  // console.log("companies ", companies);

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCompany = async (companyData) => {
    try {
      await dispatch(createCompany(companyData)).unwrap();
      toast.success('Company created successfully!');
      setShowCreateModal(false);
    } catch (error) {
      toast.error(error || 'Failed to create company');
    }
  };

  const handleUpdateCompany = async (companyId, companyData) => {
    try {
      await dispatch(updateCompany({ companyId, companyData })).unwrap();
      toast.success('Company updated successfully!');
      setEditingCompany(null);
    } catch (error) {
      toast.error('Failed to update company', error);
    }
  };

  const handleDeleteClick = (companyId) => {
    setDeleteId(companyId);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteCompany(deleteId)).unwrap();
        toast.success('Company deleted successfully!');
        setDeleteId(null);
      } catch (error) {
        toast.error('Failed to delete company', error);
      }
    }
  };

  // Only admin can manage companies
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 font-semibold">Access Denied</div>
        <p className="text-gray-600 mt-2">Only administrators can manage companies.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">Company Management</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage all companies in the system, including managers and staff.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Company
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="text-3xl font-bold text-gray-900">{companies.length}</div>
          <div className="text-gray-500 font-medium mt-1">Total Companies</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="text-3xl font-bold text-gray-900">
            {companies.filter(c => c.isActive).length}
          </div>
          <div className="text-gray-500 font-medium mt-1">Active Companies</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
          <div className="text-3xl font-bold text-gray-900">
            {companies.reduce((acc, company) => acc + (company.totalUser || 0), 0)}
          </div>
          <div className="text-gray-500 font-medium mt-1">Total Users</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search companies by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* Company List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <CompanyList
          companies={filteredCompanies}
          onEdit={setEditingCompany}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Create Company Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Company"
        size="lg"
      >
        <CompanyForm
          onSubmit={handleCreateCompany}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Company Modal */}
      <Modal
        isOpen={!!editingCompany}
        onClose={() => setEditingCompany(null)}
        title="Edit Company"
        size="lg"
      >
        <CompanyForm
          company={editingCompany}
          onSubmit={(companyData) => handleUpdateCompany(editingCompany._id, companyData)}
          onCancel={() => setEditingCompany(null)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Company"
        message="Are you sure you want to delete this company? This will also delete all associated users and tasks."
        confirmText="Delete"
        type="danger"
        isLoading={isLoading}
      />
    </div>
  );
};

export default Companies;