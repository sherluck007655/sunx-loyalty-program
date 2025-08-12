import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BoltIcon,
  GiftIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('users');
  const [dateRange, setDateRange] = useState('30');
  const [reportData, setReportData] = useState(null);
  const [exporting, setExporting] = useState(false);

  const reportTypes = [
    { id: 'users', name: 'User Report', icon: UsersIcon, description: 'Installer registration and activity data' },
    { id: 'payments', name: 'Payment Report', icon: CurrencyDollarIcon, description: 'Payment requests and transactions' },
    { id: 'serials', name: 'Serial Numbers Report', icon: BoltIcon, description: 'Serial number submissions and validation' },
    { id: 'promotions', name: 'Promotions Report', icon: GiftIcon, description: 'Promotion participation and rewards' },
    { id: 'analytics', name: 'Analytics Report', icon: ChartBarIcon, description: 'System performance and business insights' }
  ];

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' },
    { value: 'all', label: 'All time' }
  ];

  useEffect(() => {
    if (reportData) {
      generateReport();
    }
  }, [reportType, dateRange]);

  const generateReport = async () => {
    try {
      setLoading(true);
      
      let data;
      switch (reportType) {
        case 'users':
          data = await adminService.getInstallers(1, 1000);
          break;
        case 'payments':
          data = await adminService.getPayments(1, 1000);
          break;
        case 'serials':
          data = await adminService.getSerialNumbers(1, 1000);
          break;
        case 'promotions':
          const promotionsData = await adminService.getPromotions();
          data = { data: promotionsData.data }; // Ensure consistent structure
          break;
        case 'analytics':
          data = await adminService.getSystemAnalytics();
          break;
        default:
          data = { data: [] };
      }
      
      setReportData(data.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      // Create CSV content (Excel can open CSV files)
      let csvContent = '';
      let headers = [];
      let rows = [];
      
      switch (reportType) {
        case 'users':
          headers = ['Name', 'Email', 'Phone', 'City', 'Loyalty Card ID', 'Registration Date', 'Status'];
          rows = reportData.installers?.map(user => [
            user.name,
            user.email,
            user.phone || 'N/A',
            user.city,
            user.loyaltyCardId,
            formatDate(user.createdAt),
            user.status || 'Active'
          ]) || [];
          break;
        case 'payments':
          headers = ['Amount', 'Description', 'Status', 'Installer', 'Payment Method', 'Created Date', 'Updated Date'];
          rows = reportData.payments?.map(payment => [
            formatCurrency(payment.amount),
            payment.description,
            payment.status,
            payment.installer?.name || 'N/A',
            payment.paymentMethod,
            formatDate(payment.createdAt),
            formatDate(payment.updatedAt)
          ]) || [];
          break;
        case 'serials':
          headers = ['Serial Number', 'Inverter Model', 'Installer', 'City', 'Status', 'Submission Date'];
          const serialsForExport = Array.isArray(reportData) ? reportData :
                                  Array.isArray(reportData?.serials) ? reportData.serials :
                                  [];
          rows = serialsForExport.map(serial => [
            serial.serialNumber,
            serial.inverterModel,
            serial.installer?.name || serial.installerName || 'N/A',
            serial.location?.city || serial.city || 'N/A',
            serial.status || 'Active',
            formatDate(serial.createdAt || serial.submissionDate)
          ]);
          break;
        case 'promotions':
          headers = ['Title', 'Description', 'Start Date', 'End Date', 'Reward Amount', 'Status', 'Participants'];
          const promotionsForExport = Array.isArray(reportData) ? reportData :
                                     Array.isArray(reportData?.promotions) ? reportData.promotions :
                                     Array.isArray(reportData?.data) ? reportData.data :
                                     [];
          rows = promotionsForExport.map(promo => [
            promo.title,
            promo.description,
            formatDate(promo.startDate),
            formatDate(promo.endDate),
            formatCurrency(promo.rewards?.amount || 0),
            promo.status,
            promo.participantCount || 0
          ]);
          break;
        case 'analytics':
          headers = ['Metric', 'Value', 'Description'];
          rows = [
            ['Total Users', reportData.userActivity?.totalUsers || 0, 'Total registered installers'],
            ['Active Users', reportData.userActivity?.activeUsers || 0, 'Users active in last 7 days'],
            ['Total Serials', reportData.serialActivity?.totalSerials || 0, 'Total serial numbers submitted'],
            ['Total Payments', formatCurrency(reportData.paymentActivity?.totalPaymentAmount || 0), 'Total payment amount processed'],
            ['System Uptime', reportData.systemHealth?.systemUptime || 'N/A', 'System availability percentage']
          ];
          break;
      }
      
      // Create CSV content
      csvContent = headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Excel report exported successfully');
    } catch (error) {
      toast.error('Failed to export Excel report');
      console.error('Excel export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      
      // Create a simple PDF content
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 200
>>
stream
BT
/F1 16 Tf
50 750 Td
(${reportTypes.find(r => r.id === reportType)?.name || 'Report'}) Tj
0 -30 Td
/F1 12 Tf
(Generated on: ${new Date().toLocaleDateString()}) Tj
0 -20 Td
(Date Range: ${dateRanges.find(r => r.value === dateRange)?.label || 'Custom'}) Tj
0 -30 Td
(Total Records: ${
  Array.isArray(reportData) ? reportData.length :
  (reportData?.installers?.length ||
   reportData?.payments?.length ||
   (Array.isArray(reportData?.serials) ? reportData.serials.length : 0) ||
   (Array.isArray(reportData?.data) ? reportData.data.length : 0) ||
   0)
}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
450
%%EOF`;
      
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('PDF report exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF report');
      console.error('PDF export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const getReportSummary = () => {
    if (!reportData) return null;
    
    switch (reportType) {
      case 'users':
        return {
          total: reportData.installers?.length || 0,
          active: reportData.installers?.filter(u => u.status === 'active').length || 0,
          recent: reportData.installers?.filter(u => {
            const createdDate = new Date(u.createdAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
          }).length || 0
        };
      case 'payments':
        return {
          total: reportData.payments?.length || 0,
          pending: reportData.payments?.filter(p => p.status === 'pending').length || 0,
          approved: reportData.payments?.filter(p => p.status === 'approved').length || 0,
          paid: reportData.payments?.filter(p => p.status === 'paid').length || 0
        };
      case 'serials':
        const serialsArray = Array.isArray(reportData) ? reportData :
                             Array.isArray(reportData?.serials) ? reportData.serials :
                             [];
        return {
          total: serialsArray.length,
          active: serialsArray.filter(s => (s.status || 'active') === 'active').length,
          recent: serialsArray.filter(s => {
            const createdDate = new Date(s.createdAt || s.submissionDate);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return createdDate > sevenDaysAgo;
          }).length
        };
      case 'promotions':
        const promotionsArray = Array.isArray(reportData) ? reportData :
                                Array.isArray(reportData?.promotions) ? reportData.promotions :
                                Array.isArray(reportData?.data) ? reportData.data :
                                [];
        return {
          total: promotionsArray.length,
          active: promotionsArray.filter(p => p.status === 'active').length,
          participants: promotionsArray.reduce((sum, p) => sum + (p.participantCount || 0), 0)
        };
      default:
        return null;
    }
  };

  return (
    <Layout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Generate Reports
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Generate and export comprehensive system reports
            </p>
          </div>
        </div>

        {/* Report Configuration */}
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Report Type
                </label>
                <div className="space-y-2">
                  {reportTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label key={type.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                        <input
                          type="radio"
                          name="reportType"
                          value={type.id}
                          checked={reportType === type.id}
                          onChange={(e) => setReportType(e.target.value)}
                          className="form-radio"
                        />
                        <IconComponent className="h-5 w-5 text-gray-400 ml-3 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {type.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {type.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="form-select w-full"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>

                {/* Generate Report Button */}
                <button
                  onClick={generateReport}
                  disabled={loading}
                  className="btn-primary w-full mt-4"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                      Generate Report
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="card">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Report Results
                </h3>

                {/* Export Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={exportToExcel}
                    disabled={exporting}
                    className="btn-outline flex items-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export Excel'}
                  </button>
                  <button
                    onClick={exportToPDF}
                    disabled={exporting}
                    className="btn-outline flex items-center"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    {exporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                </div>
              </div>

              {/* Report Summary */}
              {getReportSummary() && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(getReportSummary()).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Report Data Preview */}
              <div className="overflow-x-auto">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Showing preview of report data. Use export buttons to download complete report.
                </div>

                {reportType === 'users' && reportData.installers && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="table-header">Name</th>
                        <th className="table-header">Email</th>
                        <th className="table-header">City</th>
                        <th className="table-header">Registration Date</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.installers.slice(0, 10).map((user) => (
                        <tr key={user.id}>
                          <td className="table-cell font-medium">{user.name}</td>
                          <td className="table-cell">{user.email}</td>
                          <td className="table-cell">{user.city}</td>
                          <td className="table-cell">{formatDate(user.createdAt)}</td>
                          <td className="table-cell">
                            <span className="badge badge-success">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType === 'payments' && reportData.payments && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Installer</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.payments.slice(0, 10).map((payment) => (
                        <tr key={payment.id}>
                          <td className="table-cell font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="table-cell">{payment.installer?.name || 'N/A'}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              payment.status === 'paid' ? 'badge-success' :
                              payment.status === 'approved' ? 'badge-info' :
                              payment.status === 'pending' ? 'badge-warning' : 'badge-error'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="table-cell">{formatDate(payment.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType === 'serials' && reportData && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="table-header">Serial Number</th>
                        <th className="table-header">Installer</th>
                        <th className="table-header">Model</th>
                        <th className="table-header">City</th>
                        <th className="table-header">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {(Array.isArray(reportData) ? reportData :
                        Array.isArray(reportData?.serials) ? reportData.serials :
                        []).slice(0, 10).map((serial, index) => (
                        <tr key={serial.id || index}>
                          <td className="table-cell font-medium">{serial.serialNumber}</td>
                          <td className="table-cell">{serial.installer?.name || serial.installerName || 'N/A'}</td>
                          <td className="table-cell">{serial.inverterModel}</td>
                          <td className="table-cell">{serial.location?.city || serial.city || 'N/A'}</td>
                          <td className="table-cell">{formatDate(serial.createdAt || serial.submissionDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType === 'promotions' && reportData && (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="table-header">Title</th>
                        <th className="table-header">Reward</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Start Date</th>
                        <th className="table-header">Participants</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {(Array.isArray(reportData) ? reportData :
                        Array.isArray(reportData?.promotions) ? reportData.promotions :
                        Array.isArray(reportData?.data) ? reportData.data :
                        []).slice(0, 10).map((promo, index) => (
                        <tr key={promo.id || index}>
                          <td className="table-cell font-medium">{promo.title}</td>
                          <td className="table-cell">{formatCurrency(promo.rewards?.amount || 0)}</td>
                          <td className="table-cell">
                            <span className={`badge ${promo.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                              {promo.status}
                            </span>
                          </td>
                          <td className="table-cell">{formatDate(promo.startDate)}</td>
                          <td className="table-cell">{promo.participantCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType === 'analytics' && reportData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">User Analytics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Users:</span>
                          <span className="font-medium">{reportData.userActivity?.totalUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Active Users:</span>
                          <span className="font-medium">{reportData.userActivity?.activeUsers || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Growth Rate:</span>
                          <span className="font-medium">{reportData.userActivity?.userGrowthRate || 0}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">System Health</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Data Integrity:</span>
                          <span className="font-medium">{reportData.systemHealth?.dataIntegrity || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">System Uptime:</span>
                          <span className="font-medium">{reportData.systemHealth?.systemUptime || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
