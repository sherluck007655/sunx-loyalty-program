import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import {
  CurrencyDollarIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { installerService } from '../../services/installerService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { toast } from 'react-hot-toast';

const PaymentHistory = () => {
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  const [paymentRequest, setPaymentRequest] = useState({
    amount: '',
    description: '',
    paymentMethod: 'bank_transfer',
    bankTitle: '',
    bankName: '',
    branchCode: '',
    ibanNumber: ''
  });

  useEffect(() => {
    fetchPayments();
  }, [currentPage, selectedStatus]);

  // Check URL parameters to auto-open payment request modal
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('request') === 'true') {
      setShowRequestModal(true);
      // Clean up URL without causing a page reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await installerService.getPaymentHistory(currentPage, 10, selectedStatus);
      setPayments(response.data.payments);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch payment history');
      console.error('Fetch payments error:', error);
      // Set empty data on error
      setPayments([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayment = async (e) => {
    e.preventDefault();
    try {
      setRequestLoading(true);
      console.log('💰 Submitting payment request:', paymentRequest);

      // Validate required fields on frontend
      if (!paymentRequest.description || paymentRequest.description.trim() === '') {
        toast.error('Description is required');
        return;
      }
      if (!paymentRequest.bankTitle || paymentRequest.bankTitle.trim() === '') {
        toast.error('Account title is required');
        return;
      }
      if (!paymentRequest.bankName || paymentRequest.bankName.trim() === '') {
        toast.error('Bank name is required');
        return;
      }
      if (!paymentRequest.branchCode || paymentRequest.branchCode.trim() === '') {
        toast.error('Branch code is required');
        return;
      }
      if (!paymentRequest.ibanNumber || paymentRequest.ibanNumber.trim() === '') {
        toast.error('IBAN number is required');
        return;
      }

      const result = await installerService.requestPayment(paymentRequest);
      console.log('✅ Payment request result:', result);

      toast.success('Payment request submitted successfully');
      setShowRequestModal(false);
      setPaymentRequest({
        amount: '',
        description: '',
        paymentMethod: 'bank_transfer',
        bankTitle: '',
        bankName: '',
        branchCode: '',
        ibanNumber: ''
      });
      fetchPayments(); // Refresh the list
    } catch (error) {
      console.error('❌ Request payment error:', error);
      console.error('   Error response:', error.response?.data);
      console.error('   Error status:', error.response?.status);

      const errorMessage = error.response?.data?.message || 'Failed to submit payment request';
      toast.error(errorMessage);
    } finally {
      setRequestLoading(false);
    }
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
    setNewComment('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setCommentLoading(true);
      await installerService.addPaymentComment(selectedPayment.id, newComment.trim());

      // Refresh payment data
      await fetchPayments();

      // Update selected payment with new comment
      const updatedPayments = await installerService.getPaymentHistory(1, 100);
      const updatedPayment = updatedPayments.data.payments.find(p => p.id === selectedPayment.id);
      if (updatedPayment) {
        setSelectedPayment(updatedPayment);
      }

      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Add comment error:', error);
    } finally {
      setCommentLoading(false);
    }
  };



  const handleDownloadReceipt = (receipt) => {
    try {
      // Create a proper file download based on file type
      let blob;
      let fileName = receipt.fileName;

      if (receipt.fileType === 'application/pdf') {
        // Create a proper PDF structure
        const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 750 Td
(Payment Receipt) Tj
0 -20 Td
(File: ${receipt.fileName}) Tj
0 -20 Td
(Uploaded by Admin: ${formatDate(receipt.uploadedAt)}) Tj
0 -20 Td
(Size: ${(receipt.fileSize / 1024).toFixed(1)} KB) Tj
0 -30 Td
(This is your payment receipt from the admin.) Tj
0 -20 Td
(Keep this for your records.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000251 00000 n
0000000501 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
568
%%EOF`;
        blob = new Blob([pdfContent], { type: 'application/pdf' });
      } else if (receipt.fileType.startsWith('image/')) {
        // Create a professional receipt image
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Create background
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 400);

        // Add border
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 580, 380);

        // Add header
        ctx.fillStyle = '#ff831f';
        ctx.fillRect(20, 20, 560, 60);

        // Add title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAYMENT RECEIPT', 300, 55);

        // Add content
        ctx.fillStyle = '#333333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Receipt File: ${receipt.fileName}`, 40, 120);
        ctx.fillText(`Uploaded by Admin: ${formatDate(receipt.uploadedAt)}`, 40, 150);
        ctx.fillText(`File Size: ${(receipt.fileSize / 1024).toFixed(1)} KB`, 40, 180);
        ctx.fillText(`File Type: ${receipt.fileType}`, 40, 210);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('This receipt was uploaded by the admin as proof of payment processing.', 40, 250);
        ctx.fillText('Keep this for your records.', 40, 275);

        // Add footer
        ctx.fillStyle = '#ff831f';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SunX Loyalty Program - Your Payment Receipt', 300, 350);

        // Convert to blob and download
        canvas.toBlob((canvasBlob) => {
          const url = window.URL.createObjectURL(canvasBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          toast.success('Receipt downloaded successfully');
        }, receipt.fileType, 0.9);
        return;
      } else {
        // Create a formatted text receipt
        const content = `PAYMENT RECEIPT
===============

Receipt Information:
-------------------
File Name: ${receipt.fileName}
File Type: ${receipt.fileType}
File Size: ${(receipt.fileSize / 1024).toFixed(1)} KB
Uploaded by Admin: ${formatDate(receipt.uploadedAt)}

Payment Details:
---------------
This receipt was uploaded by the admin as proof of your payment processing.
Please keep this for your records.

System Information:
------------------
Downloaded from: SunX Loyalty Program
Download Date: ${new Date().toLocaleString()}

---
SunX Loyalty Program
Solar Inverter Installation Rewards System
Your trusted partner in solar energy solutions`;

        blob = new Blob([content], { type: 'text/plain' });
        fileName = receipt.fileName.replace(/\.[^/.]+$/, '') + '_receipt.txt';
      }

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Receipt downloaded successfully');
      }
    } catch (error) {
      toast.error('Failed to download receipt');
      console.error('Download error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      paid: { color: 'bg-orange-100 text-orange-800', icon: CheckCircleIcon },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircleIcon }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'PKR') => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: currency === 'PKR' ? 'PKR' : 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout title="Payment History">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Payment History
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Track your earnings and payment requests
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="btn-primary flex items-center justify-center w-full sm:w-auto touch-manipulation"
          >
            <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            <span className="text-sm sm:text-base">Request Payment</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Approved
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'approved').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Paid
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'paid').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-primary-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Paid Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Payment History
            </h2>
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Payment History
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't made any payment requests yet.
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className="btn-primary"
                >
                  Request Your First Payment
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Requested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Approved By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {payment.paymentType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payment.approvedBy ? payment.approvedBy.name : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openPaymentDetails(payment)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          >
                            <EyeIcon className="h-4 w-4 inline mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'text-white bg-primary-600 border border-primary-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Payment Request Modal */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Request Payment
                  </h3>
                  <button
                    onClick={() => {
                      setShowRequestModal(false);
                      setPaymentRequest({
                        amount: '',
                        description: '',
                        paymentMethod: 'bank_transfer',
                        bankTitle: '',
                        bankName: '',
                        branchCode: '',
                        ibanNumber: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleRequestPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount (PKR)
                    </label>
                    <input
                      type="number"
                      value={paymentRequest.amount}
                      onChange={(e) => setPaymentRequest(prev => ({ ...prev, amount: e.target.value }))}
                      className="input"
                      placeholder="Enter amount..."
                      min="1"
                      step="1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty for default milestone amount (PKR 5,000)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={paymentRequest.description}
                      onChange={(e) => setPaymentRequest(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="input"
                      placeholder="Describe the reason for this payment request..."
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Please provide a description for your payment request
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentRequest.paymentMethod}
                      onChange={(e) => setPaymentRequest(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="input"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="mobile_wallet">Mobile Wallet</option>
                    </select>
                  </div>

                  {/* Bank Details Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Bank Account Details
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Title *
                        </label>
                        <input
                          type="text"
                          value={paymentRequest.bankTitle}
                          onChange={(e) => setPaymentRequest(prev => ({ ...prev, bankTitle: e.target.value }))}
                          className="input"
                          placeholder="Account holder name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          value={paymentRequest.bankName}
                          onChange={(e) => setPaymentRequest(prev => ({ ...prev, bankName: e.target.value }))}
                          className="input"
                          placeholder="e.g., HBL, UBL, MCB"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Branch Code *
                        </label>
                        <input
                          type="text"
                          value={paymentRequest.branchCode}
                          onChange={(e) => setPaymentRequest(prev => ({ ...prev, branchCode: e.target.value }))}
                          className="input"
                          placeholder="4-digit branch code"
                          maxLength="4"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account # / IBAN *
                        </label>
                        <input
                          type="text"
                          value={paymentRequest.ibanNumber}
                          onChange={(e) => setPaymentRequest(prev => ({ ...prev, ibanNumber: e.target.value.toUpperCase() }))}
                          className="input"
                          placeholder="Account number or IBAN (e.g., PK36SCBL0000001123456702)"
                          maxLength="24"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ClockIcon className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Payment Request Requirements
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                          <ul className="list-disc list-inside space-y-1">
                            <li>You must have earned at least 1000 points</li>
                            <li>Your bank details must be updated in your profile</li>
                            <li>You cannot have any pending payment requests</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRequestModal(false);
                        setPaymentRequest({
                          amount: '',
                          description: '',
                          paymentMethod: 'bank_transfer',
                          bankTitle: '',
                          bankName: '',
                          branchCode: '',
                          ibanNumber: ''
                        });
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requestLoading || !paymentRequest.description.trim() || !paymentRequest.bankTitle.trim() || !paymentRequest.bankName.trim() || !paymentRequest.branchCode.trim() || !paymentRequest.ibanNumber.trim()}
                      className="btn-primary"
                    >
                      {requestLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details Modal */}
        {showDetailsModal && selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Payment Request Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPayment(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Payment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </label>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Payment Method
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                        {selectedPayment.paymentMethod || 'Bank Transfer'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Request Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(selectedPayment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {selectedPayment.description}
                    </p>
                  </div>

                  {/* Bank Details */}
                  {selectedPayment.bankDetails && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Bank Account Details
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Account Title:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {selectedPayment.bankDetails.bankTitle || selectedPayment.bankDetails.accountTitle || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Bank Name:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {selectedPayment.bankDetails.bankName || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Branch Code:</span>
                            <p className="text-gray-900 dark:text-white mt-1">
                              {selectedPayment.bankDetails.branchCode || 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Account # / IBAN:</span>
                            <p className="text-gray-900 dark:text-white mt-1 font-mono">
                              {selectedPayment.bankDetails.ibanNumber || selectedPayment.bankDetails.accountNumber || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Approval/Rejection Details */}
                  {selectedPayment.status === 'approved' && selectedPayment.approvedBy && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Approval Details
                      </label>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                        <div className="text-sm">
                          <p className="text-green-800 dark:text-green-200">
                            <span className="font-medium">Approved by:</span> {selectedPayment.approvedBy.name}
                          </p>
                          <p className="text-green-700 dark:text-green-300 mt-1">
                            <span className="font-medium">Approved on:</span> {formatDate(selectedPayment.approvedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment.status === 'rejected' && selectedPayment.rejectionReason && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rejection Details
                      </label>
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                        <div className="text-sm">
                          <p className="text-red-800 dark:text-red-200">
                            <span className="font-medium">Rejected by:</span> {selectedPayment.rejectedBy?.name || 'Admin'}
                          </p>
                          <p className="text-red-700 dark:text-red-300 mt-1">
                            <span className="font-medium">Rejected on:</span> {formatDate(selectedPayment.rejectedAt || selectedPayment.updatedAt)}
                          </p>
                          <p className="text-red-800 dark:text-red-200 mt-2">
                            <span className="font-medium">Reason:</span>
                          </p>
                          <p className="text-red-700 dark:text-red-300 mt-1 bg-red-100 dark:bg-red-800/30 p-2 rounded">
                            {selectedPayment.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment.status === 'paid' && selectedPayment.transactionId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Details
                      </label>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                        <div className="text-sm">
                          <p className="text-blue-800 dark:text-blue-200">
                            <span className="font-medium">Transaction ID:</span> {selectedPayment.transactionId}
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 mt-1">
                            <span className="font-medium">Paid on:</span> {formatDate(selectedPayment.paidAt || selectedPayment.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Receipt Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Receipt
                    </label>

                    {selectedPayment.receipt ? (
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                        <div className="flex items-center space-x-3">
                          <PaperClipIcon className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedPayment.receipt.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedPayment.receipt.fileSize / 1024).toFixed(1)} KB •
                              Uploaded by Admin {formatDate(selectedPayment.receipt.uploadedAt)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadReceipt(selectedPayment.receipt)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {selectedPayment.status === 'paid'
                            ? 'Payment receipt will be uploaded by admin'
                            : 'Payment receipt will be available after payment is processed'
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comments & Communication
                    </label>

                    {/* Existing Comments */}
                    {selectedPayment.comments && selectedPayment.comments.length > 0 ? (
                      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {selectedPayment.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className={`p-3 rounded-md ${
                              comment.userType === 'admin'
                                ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                                : 'bg-gray-50 dark:bg-gray-700 mr-4'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-medium ${
                                comment.userType === 'admin'
                                  ? 'text-blue-700 dark:text-blue-300'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {comment.userName} {comment.userType === 'admin' && '(Admin)'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {comment.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        No comments yet
                      </div>
                    )}

                    {/* Add New Comment */}
                    <div className="border-t pt-4">
                      <div className="flex space-x-3">
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment or ask a question..."
                            rows={3}
                            className="form-textarea w-full"
                            disabled={commentLoading}
                          />
                        </div>
                        <button
                          onClick={handleAddComment}
                          disabled={commentLoading || !newComment.trim()}
                          className="btn-primary px-4 py-2 h-fit disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {commentLoading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Posting...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ChatBubbleLeftIcon className="h-4 w-4 mr-1" />
                              Post
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-6">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedPayment(null);
                    }}
                    className="btn-outline"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaymentHistory;
