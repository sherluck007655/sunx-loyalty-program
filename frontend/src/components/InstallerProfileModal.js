import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  BanknotesIcon,
  QrCodeIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../services/adminService';
import { formatDate, formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const InstallerProfileModal = ({ installer, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [payments, setPayments] = useState([]);
  const [serials, setSerials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (isOpen && installer) {
      fetchInstallerData();
    }
  }, [isOpen, installer]);

  const fetchInstallerData = async () => {
    try {
      setLoading(true);
      const [paymentsResponse, serialsResponse] = await Promise.all([
        adminService.getInstallerPayments(installer.id),
        adminService.getInstallerSerials(installer.id)
      ]);
      
      setPayments(paymentsResponse.data.payments);
      setSerials(serialsResponse.data.serials);
    } catch (error) {
      toast.error('Failed to fetch installer data');
      console.error('Fetch installer data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusUpdate = async (paymentId, status, additionalData = {}) => {
    try {
      setActionLoading(true);
      const statusData = { status, ...additionalData };
      await adminService.updatePaymentStatus(paymentId, statusData);
      toast.success(`Payment ${status} successfully`);
      fetchInstallerData(); // Refresh data
      if (onUpdate) onUpdate(); // Notify parent to refresh
    } catch (error) {
      toast.error(`Failed to ${status} payment`);
      console.error('Update payment status error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId, description) => {
    if (!window.confirm(`Are you sure you want to delete the payment "${description}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deletePayment(paymentId);
      toast.success('Payment deleted successfully');
      fetchInstallerData(); // Refresh data
      if (onUpdate) onUpdate(); // Notify parent to refresh
    } catch (error) {
      toast.error('Failed to delete payment');
      console.error('Delete payment error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSerial = async (serialId, serialNumber) => {
    if (!window.confirm(`Are you sure you want to delete serial number ${serialNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deleteSerial(serialId);
      toast.success('Serial number deleted successfully');
      fetchInstallerData(); // Refresh data
      if (onUpdate) onUpdate(); // Notify parent to refresh
    } catch (error) {
      toast.error('Failed to delete serial number');
      console.error('Delete serial error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!isOpen || !installer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-600 dark:text-primary-400">
                      {installer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {installer.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {installer.loyaltyCardId} • {installer.email}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-4">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payments'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Payment History ({payments.length})
                </button>
                <button
                  onClick={() => setActiveTab('serials')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'serials'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Serial Numbers ({serials.length})
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-6 py-4 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    {/* Contact Information */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{installer.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{installer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{installer.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <CreditCardIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">CNIC</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{installer.cnic}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bank Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Account Title</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{installer.bankDetails?.accountTitle}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Account Number</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{installer.bankDetails?.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Bank Name</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{installer.bankDetails?.bankName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Branch Code</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{installer.bankDetails?.branchCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Metrics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{installer.totalInstallations}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Installations</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(installer.totalEarnings)}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{installer.performance?.averageRating}★</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div className="space-y-4">
                    {payments.length === 0 ? (
                      <div className="text-center py-8">
                        <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No payment requests found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment) => (
                          <div key={payment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <BanknotesIcon className="h-5 w-5 text-green-600 mr-2" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(payment.amount)}
                                </span>
                                {getStatusBadge(payment.status)}
                              </div>
                              <div className="flex space-x-2">
                                {payment.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handlePaymentStatusUpdate(payment.id, 'approved')}
                                      disabled={actionLoading}
                                      className="text-green-600 hover:text-green-900 text-sm"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handlePaymentStatusUpdate(payment.id, 'rejected', { rejectionReason: 'Rejected by admin' })}
                                      disabled={actionLoading}
                                      className="text-red-600 hover:text-red-900 text-sm"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {payment.status === 'approved' && (
                                  <button
                                    onClick={() => handlePaymentStatusUpdate(payment.id, 'paid', { transactionId: `TXN-${Date.now()}` })}
                                    disabled={actionLoading}
                                    className="text-blue-600 hover:text-blue-900 text-sm"
                                  >
                                    Mark as Paid
                                  </button>
                                )}
                                {payment.status === 'paid' && (
                                  <button
                                    onClick={() => handlePaymentStatusUpdate(payment.id, 'pending')}
                                    disabled={actionLoading}
                                    className="text-yellow-600 hover:text-yellow-900 text-sm"
                                  >
                                    Revert to Pending
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeletePayment(payment.id, payment.description)}
                                  disabled={actionLoading}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{payment.description}</p>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              <span>Requested: {formatDate(payment.createdAt)}</span>
                              {payment.approvedAt && <span> • Approved: {formatDate(payment.approvedAt)}</span>}
                              {payment.paidAt && <span> • Paid: {formatDate(payment.paidAt)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Serials Tab */}
                {activeTab === 'serials' && (
                  <div className="space-y-4">
                    {serials.length === 0 ? (
                      <div className="text-center py-8">
                        <QrCodeIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No serial numbers submitted</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {serials.map((serial) => (
                          <div key={serial.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <QrCodeIcon className="h-5 w-5 text-primary-600 mr-2" />
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {serial.serialNumber}
                                </span>
                              </div>
                              <button
                                onClick={() => handleDeleteSerial(serial.id, serial.serialNumber)}
                                disabled={actionLoading}
                                className="text-red-600 hover:text-red-900"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Model:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{serial.inverterModel}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Capacity:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{serial.capacity}W</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Installation:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{formatDate(serial.installationDate)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                <span className="ml-2 text-gray-900 dark:text-white">{serial.location.city}</span>
                              </div>
                            </div>
                            {serial.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{serial.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallerProfileModal;
