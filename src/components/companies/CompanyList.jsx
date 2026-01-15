import React from 'react';
import { format } from 'date-fns';
import {
  BuildingOfficeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const CompanyList = ({ companies, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Staff
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => (
            <tr key={company._id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{company.email}</div>
                <div className="text-sm text-gray-500">{company.phone}</div>
                <div className="text-sm text-gray-500">{company.address}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="text-sm text-gray-500">{company.totalUser}</div>


                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {company.isActive ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-sm text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <span className="text-sm text-red-700">Inactive</span>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {format(new Date(company.createdAt), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit && onEdit(company)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Company"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(company._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Company"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {companies.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first company.
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanyList;