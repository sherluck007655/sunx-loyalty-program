import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  ChatBubbleLeftIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [paymentSlipFile, setPaymentSlipFile] = useState(null);
  const [slipUploading, setSlipUploading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [receiptDeleteLoading, setReceiptDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, selectedStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await adminService.getPayments(currentPage, 10, selectedStatus);
      setPayments(response.data.payments);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      toast.error('Failed to fetch payments');
      console.error('Fetch payments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId, status, additionalData = {}) => {
    try {
      setActionLoading(true);
      const statusData = { status, ...additionalData };

      await adminService.updatePaymentStatus(paymentId, statusData);
      toast.success(`Payment ${status} successfully`);

      // Refresh payments list
      fetchPayments();
      setShowModal(false);
      setSelectedPayment(null);
      setRejectionReason('');
      setTransactionId('');
    } catch (error) {
      toast.error(`Failed to ${status} payment`);
      console.error('Update payment status error:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const openPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
    setNewComment('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setCommentLoading(true);
      await adminService.addPaymentComment(selectedPayment.id, newComment.trim());

      // Refresh payments data
      await fetchPayments();

      // Update selected payment with new comment
      const updatedPayments = await adminService.getPayments(1, 100);
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

  const handlePaymentSlipUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG) or PDF file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setSlipUploading(true);

      // In a real app, you would upload to a file storage service
      // For now, we'll simulate the upload
      const slipData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadedBy: 'admin',
        description: 'Payment slip uploaded by admin'
      };

      await adminService.addPaymentReceipt(selectedPayment.id, slipData);

      // Refresh payments data
      await fetchPayments();

      // Update selected payment
      const updatedPayments = await adminService.getPayments(1, 100);
      const updatedPayment = updatedPayments.data.payments.find(p => p.id === selectedPayment.id);
      if (updatedPayment) {
        setSelectedPayment(updatedPayment);
      }

      toast.success('Payment slip uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload payment slip');
      console.error('Payment slip upload error:', error);
    } finally {
      setSlipUploading(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment request? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      await adminService.deletePayment(paymentId);
      toast.success('Payment request deleted successfully');

      // Refresh payments list
      await fetchPayments();
      setShowModal(false);
      setSelectedPayment(null);
    } catch (error) {
      toast.error('Failed to delete payment request');
      console.error('Delete payment error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadReceipt = (receipt) => {
    try {
      // Create a proper file download based on file type
      let blob;
      let fileName = receipt.fileName;

      if (receipt.fileType === 'application/pdf') {
        // Create a proper PDF with jsPDF-like structure
        const { jsPDF } = window.jspdf || {};

        if (typeof jsPDF !== 'undefined') {
          // If jsPDF is available, create a proper PDF
          const doc = new jsPDF();
          doc.setFontSize(16);
          doc.text('Payment Receipt', 20, 30);
          doc.setFontSize(12);
          doc.text(`File: ${receipt.fileName}`, 20, 50);
          doc.text(`Uploaded: ${formatDate(receipt.uploadedAt)}`, 20, 70);
          doc.text(`Size: ${(receipt.fileSize / 1024).toFixed(1)} KB`, 20, 90);
          doc.text('This is a sample payment receipt for demonstration.', 20, 110);
          doc.text('In a real application, this would be the actual receipt.', 20, 130);

          // Save the PDF
          doc.save(fileName);
          toast.success('PDF receipt downloaded successfully');
          return;
        } else {
          // Fallback: Create a more complete PDF structure
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
(Uploaded: ${formatDate(receipt.uploadedAt)}) Tj
0 -20 Td
(Size: ${(receipt.fileSize / 1024).toFixed(1)} KB) Tj
0 -30 Td
(This is a sample payment receipt for demonstration.) Tj
0 -20 Td
(In a real application, this would be the actual receipt file.) Tj
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
        }
      } else if (receipt.fileType.startsWith('image/')) {
        // Create a proper image file
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Create a professional-looking receipt
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
        ctx.fillText(`Upload Date: ${formatDate(receipt.uploadedAt)}`, 40, 150);
        ctx.fillText(`File Size: ${(receipt.fileSize / 1024).toFixed(1)} KB`, 40, 180);
        ctx.fillText(`File Type: ${receipt.fileType}`, 40, 210);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#666666';
        ctx.fillText('This is a sample receipt for demonstration purposes.', 40, 250);
        ctx.fillText('In a real application, this would be the actual uploaded receipt.', 40, 275);

        // Add footer
        ctx.fillStyle = '#ff831f';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('SunX Loyalty Program - Solar Inverter Installation Rewards', 300, 350);

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
          toast.success('Image receipt downloaded successfully');
        }, receipt.fileType, 0.9);
        return;
      } else {
        // For other file types, create a formatted document
        const content = `PAYMENT RECEIPT
===============

Receipt Information:
-------------------
File Name: ${receipt.fileName}
File Type: ${receipt.fileType}
File Size: ${(receipt.fileSize / 1024).toFixed(1)} KB
Upload Date: ${formatDate(receipt.uploadedAt)}

Payment Details:
---------------
This receipt was uploaded as proof of payment processing.
The original file format was: ${receipt.fileType}

System Information:
------------------
Downloaded from: SunX Loyalty Program
Download Date: ${new Date().toLocaleString()}

Note: This is a sample receipt file for demonstration purposes.
In a real application, this would be the actual uploaded receipt file.

---
SunX Loyalty Program
Solar Inverter Installation Rewards System`;

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

  const handleDeleteReceipt = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      return;
    }

    try {
      setReceiptDeleteLoading(true);
      await adminService.deletePaymentReceipt(paymentId);

      // Refresh payments data
      await fetchPayments();

      // Update selected payment
      const updatedPayments = await adminService.getPayments(1, 100);
      const updatedPayment = updatedPayments.data.payments.find(p => p.id === selectedPayment.id);
      if (updatedPayment) {
        setSelectedPayment(updatedPayment);
      }

      toast.success('Receipt deleted successfully');
    } catch (error) {
      toast.error('Failed to delete receipt');
      console.error('Delete receipt error:', error);
    } finally {
      setReceiptDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
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
    <Layout title="Manage Payments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Manage Payments
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Review and approve payment requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Approved
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {payments.filter(p => p.status === 'approved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                    Paid
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {payments.filter(p => p.status === 'paid').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    Total Paid
                  </p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {formatCurrency(payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2">
                  Filter by Status
                </Label>
                <Select
                  value={selectedStatus || "all"}
                  onValueChange={(value) => {
                    setSelectedStatus(value === "all" ? "" : value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12">
                <CurrencyDollarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Payment Requests
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No payment requests found for the selected filters.
                </p>
              </div>
            ) : (
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Installer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id || payment._id}>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">
                              {payment.installer?.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.installer?.email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {payment.installer?.loyaltyCardId}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {payment.paymentType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPaymentModal(payment)}
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePayment(payment.id)}
                              disabled={deleteLoading}
                              className="text-destructive hover:text-destructive"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            {payment.status === 'pending' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleStatusUpdate(payment.id || payment._id, 'approved')}
                                  disabled={actionLoading}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPaymentModal(payment)}
                                  disabled={actionLoading}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <XCircleIcon className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {payment.status === 'approved' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPaymentModal(payment)}
                                disabled={actionLoading}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                Mark Paid
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </CardContent>
        </Card>

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

        {/* Payment Details Modal */}
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Payment Request Details
                  </h3>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedPayment(null);
                      setRejectionReason('');
                      setTransactionId('');
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
                        Installer
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {selectedPayment.installer?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {selectedPayment.installer?.email}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount
                      </label>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Payment Type
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                        {selectedPayment.paymentType}
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
                        Bank Account Details (Submitted by Installer)
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

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment Method (Selected by Installer)
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                      {selectedPayment.paymentMethod || 'Bank Transfer'}
                    </p>
                  </div>

                  {/* Submission Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Request Submitted On
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {formatDate(selectedPayment.createdAt)}
                    </p>
                  </div>

                  {/* Action Forms */}
                  {selectedPayment.status === 'pending' && (
                    <div className="border-t pt-4">
                      <div className="space-y-4">
                        {/* Rejection Form */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rejection Reason (if rejecting)
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            className="input"
                            placeholder="Enter reason for rejection..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPayment.status === 'approved' && (
                    <div className="border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          className="input"
                          placeholder="Enter transaction ID..."
                        />
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
                              Uploaded {formatDate(selectedPayment.receipt.uploadedAt)}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownloadReceipt(selectedPayment.receipt)}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Download
                            </button>
                            <button
                              onClick={() => handleDeleteReceipt(selectedPayment.id)}
                              disabled={receiptDeleteLoading}
                              className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                            >
                              {receiptDeleteLoading ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-4">
                        <div className="text-center">
                          <PaperClipIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Upload payment receipt after processing payment
                          </p>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handlePaymentSlipUpload}
                            disabled={slipUploading}
                            className="hidden"
                            id="payment-slip-upload"
                          />
                          <label
                            htmlFor="payment-slip-upload"
                            className={`btn-outline text-sm cursor-pointer ${
                              slipUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {slipUploading ? 'Uploading...' : 'Upload Receipt'}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, or PDF (max 5MB)
                          </p>
                        </div>
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
                                ? 'bg-blue-50 dark:bg-blue-900/20 mr-4'
                                : 'bg-gray-50 dark:bg-gray-700 ml-4'
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
                            placeholder="Add a comment or request additional information..."
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

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4 border-t">
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeletePayment(selectedPayment.id)}
                      disabled={deleteLoading}
                      className="btn-outline text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {deleteLoading ? 'Deleting...' : 'Delete Request'}
                    </button>

                    {/* Main Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setSelectedPayment(null);
                          setRejectionReason('');
                          setTransactionId('');
                          setNewComment('');
                        }}
                        className="btn-outline"
                      >
                        Cancel
                      </button>

                    {selectedPayment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(selectedPayment.id || selectedPayment._id, 'approved')}
                          disabled={actionLoading}
                          className="btn-primary bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedPayment.id || selectedPayment._id, 'rejected', { rejectionReason })}
                          disabled={actionLoading || !rejectionReason.trim()}
                          className="btn-primary bg-red-600 hover:bg-red-700"
                        >
                          {actionLoading ? 'Processing...' : 'Reject'}
                        </button>
                      </>
                    )}

                    {selectedPayment.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(selectedPayment.id || selectedPayment._id, 'paid', { transactionId })}
                        disabled={actionLoading || !transactionId.trim()}
                        className="btn-primary bg-blue-600 hover:bg-blue-700"
                      >
                        {actionLoading ? 'Processing...' : 'Mark as Paid'}
                      </button>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminPayments;
