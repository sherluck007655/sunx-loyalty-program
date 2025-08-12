import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  PlusIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  MapPinIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { serialService } from '../../services/serialService';
import { installerService } from '../../services/installerService';
import { formatDate } from '../../utils/formatters';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const SerialNumbers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [serials, setSerials] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadSerials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading serials with params:', { currentPage, searchTerm });

      const response = await installerService.getSerialNumbers(currentPage, 10, searchTerm);
      console.log('📊 API Response:', response);

      if (response.success) {
        setSerials(response.data.serials || []);
        setPagination(response.data.pagination || {});
        console.log('✅ Serials loaded:', response.data.serials?.length || 0);
      } else {
        setError('Failed to load serial numbers');
      }
    } catch (err) {
      console.error('❌ Error loading serials:', err);
      setError(err.response?.data?.message || 'Failed to load serial numbers');
      toast.error('Failed to load serial numbers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    loadSerials();
  }, [loadSerials]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };



  return (
    <Layout title="Serial Numbers">
      <div className="space-y-6 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Serial Numbers
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your inverter installations
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={loadSerials}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/serials/add" className="flex items-center justify-center">
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                <span className="hidden sm:inline">Add Serial Number</span>
                <span className="sm:hidden">Add Serial</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search serial numbers..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground mt-4">Loading serial numbers...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-destructive/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Error Loading Serial Numbers
              </h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={loadSerials}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : serials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No Serial Numbers Found' : 'No Serial Numbers Yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? `No serial numbers match "${searchTerm}"`
                  : 'Start by adding your first inverter installation'
                }
              </p>
              <Button asChild>
                <Link to="/serials/add">
                  Add Your First Serial Number
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {serials.map((serial) => (
                  <div
                    key={serial.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {serial.serialNumber}
                          </h3>
                          <Badge
                            variant={
                              serial.status === 'active' ? 'success' :
                              serial.status === 'inactive' ? 'destructive' : 'warning'
                            }
                          >
                            {serial.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            {formatDate(serial.installationDate)}
                          </div>
                          {serial.location?.city && (
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-2" />
                              {serial.location.city}
                            </div>
                          )}
                          {serial.inverterModel && (
                            <div className="flex items-center">
                              <CpuChipIcon className="h-4 w-4 mr-2" />
                              {serial.inverterModel}
                            </div>
                          )}
                        </div>

                        {serial.location?.address && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {serial.location.address}
                          </p>
                        )}
                      </div>


                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-dark-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                      disabled={currentPage === pagination.totalPages}
                      className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-6 right-6 sm:hidden z-50">
          <Link
            to="/serials/add"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title="Add Serial Number"
          >
            <PlusIcon className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default SerialNumbers;
