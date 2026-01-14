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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Company Management</h1>
            </div>
            <p className="mt-2 opacity-90">
              Manage all companies in the system. Each company can have multiple managers and staff.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Company
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
          <div className="text-gray-600">Total Companies</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">
            {companies.filter(c => c.isActive).length}
          </div>
          <div className="text-gray-600">Active Companies</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">
            {companies.reduce((acc, company) => acc + (company.totalUser || 0), 0)}
          </div>
          <div className="text-gray-600">Total Users</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search companies by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
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