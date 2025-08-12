import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import LoadingSpinner from './LoadingSpinner';

const EditInstallerForm = ({ installer, onSave, onCancel, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: installer.name || '',
      email: installer.email || '',
      phone: installer.phone || '',
      cnic: installer.cnic || '',
      address: installer.address || '',
      city: installer.city || '',
      loyaltyCardId: installer.loyaltyCardId || '',
      status: installer.status || 'pending',
      accountTitle: installer.bankDetails?.accountTitle || '',
      accountNumber: installer.bankDetails?.accountNumber || '',
      bankName: installer.bankDetails?.bankName || '',
      branchCode: installer.bankDetails?.branchCode || ''
    }
  });

  const onSubmit = (data) => {
    const editedData = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      cnic: data.cnic,
      address: data.address,
      city: data.city,
      loyaltyCardId: data.loyaltyCardId,
      status: data.status,
      bankDetails: {
        accountTitle: data.accountTitle,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        branchCode: data.branchCode
      },
      updatedAt: new Date().toISOString()
    };
    onSave(editedData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className="form-input"
              placeholder="Enter full name"
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Email</label>
            <input
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              type="email"
              className="form-input"
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Phone Number</label>
            <input
              {...register('phone', { required: 'Phone number is required' })}
              type="tel"
              className="form-input"
              placeholder="+92-300-1234567"
            />
            {errors.phone && (
              <p className="form-error">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">CNIC</label>
            <input
              {...register('cnic', { required: 'CNIC is required' })}
              type="text"
              className="form-input"
              placeholder="12345-1234567-1"
            />
            {errors.cnic && (
              <p className="form-error">{errors.cnic.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">City</label>
            <input
              {...register('city', { required: 'City is required' })}
              type="text"
              className="form-input"
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="form-error">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">Loyalty Card ID</label>
            <input
              {...register('loyaltyCardId')}
              type="text"
              className="form-input"
              placeholder="SUNX-000001"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Address</label>
          <textarea
            {...register('address', { required: 'Address is required' })}
            className="form-input"
            rows="2"
            placeholder="Enter complete address"
          />
          {errors.address && (
            <p className="form-error">{errors.address.message}</p>
          )}
        </div>
      </div>

      {/* Account Status */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Account Status
        </h4>
        <div>
          <label className="form-label">Status</label>
          <select
            {...register('status', { required: 'Status is required' })}
            className="form-input"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
          {errors.status && (
            <p className="form-error">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Bank Details */}
      <div>
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
          Bank Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Account Title</label>
            <input
              {...register('accountTitle')}
              type="text"
              className="form-input"
              placeholder="Account holder name"
            />
          </div>

          <div>
            <label className="form-label">Account Number</label>
            <input
              {...register('accountNumber')}
              type="text"
              className="form-input"
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="form-label">Bank Name</label>
            <input
              {...register('bankName')}
              type="text"
              className="form-input"
              placeholder="Bank name"
            />
          </div>

          <div>
            <label className="form-label">Branch Code</label>
            <input
              {...register('branchCode')}
              type="text"
              className="form-input"
              placeholder="Branch code"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span className="ml-2">Saving...</span>
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default EditInstallerForm;
