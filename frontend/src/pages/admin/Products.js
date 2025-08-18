import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  BoltIcon,
  SunIcon,
  CogIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { formatCurrency } from '../../utils/formatters';
import ProductModal from '../../components/ProductModal';
import toast from 'react-hot-toast';

const ProductTypeIcons = {
  inverter: BoltIcon,
  battery: CubeIcon,
  solar_panel: SunIcon,
  charge_controller: CogIcon,
  monitoring_system: EyeIcon,
  accessories: WrenchScrewdriverIcon
};

const ProductTypeColors = {
  inverter: 'bg-orange-100 text-orange-800',
  battery: 'bg-green-100 text-green-800',
  solar_panel: 'bg-yellow-100 text-yellow-800',
  charge_controller: 'bg-purple-100 text-purple-800',
  monitoring_system: 'bg-indigo-100 text-indigo-800',
  accessories: 'bg-gray-100 text-gray-800'
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byType: []
  });

  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProducts({
        search: searchTerm,
        type: typeFilter === 'all' ? '' : typeFilter,
        isActive: statusFilter === 'all' ? '' : statusFilter
      });

      if (response.success) {
        setProducts(response.data);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      if (response.success && response.data.products) {
        setStats(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteProduct = (productId) => {
    setPendingDeleteId(productId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async (force) => {
    if (!pendingDeleteId) return;
    try {
      const response = await adminService.deleteProduct(pendingDeleteId, { force });
      if (response.success) {
        toast.success(response.message || (force ? 'Product permanently deleted' : 'Product deactivated'));
        fetchProducts();
        fetchProductStats();
      } else {
        toast.error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    } finally {
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const filteredProducts = sortedProducts.filter(product => {
    const matchesSearch = !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = !typeFilter || typeFilter === 'all' || product.type === typeFilter;
    const matchesStatus = !statusFilter || statusFilter === 'all' ||
      (statusFilter === 'active' && product.isActive) ||
      (statusFilter === 'inactive' && !product.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type) => {
    const IconComponent = ProductTypeIcons[type] || CubeIcon;
    return <IconComponent className="h-5 w-5" />;
  };

  const getTypeColor = (type) => {
    return ProductTypeColors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage products and their point values</p>
          </div>
          <Button onClick={handleAddProduct} className="bg-orange-500 hover:bg-orange-600">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <CubeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <BoltIcon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Products</CardTitle>
              <TrashIcon className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Points</CardTitle>
              <CubeIcon className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.averagePoints || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="inverter">Inverter</SelectItem>
                  <SelectItem value="battery">Battery</SelectItem>
                  <SelectItem value="solar_panel">Solar Panel</SelectItem>
                  <SelectItem value="charge_controller">Charge Controller</SelectItem>
                  <SelectItem value="monitoring_system">Monitoring System</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={handleSearch} variant="outline">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortBy === 'name' && (
                          sortOrder === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                            <ArrowDownIcon className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Manufacturer</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('points')}
                    >
                      <div className="flex items-center">
                        Points
                        {sortBy === 'points' && (
                          sortOrder === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                            <ArrowDownIcon className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getTypeIcon(product.type)}
                          <Badge className={`ml-2 ${getTypeColor(product.type)}`}>
                            {product.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{product.model}</TableCell>
                      <TableCell>{product.manufacturer || 'N/A'}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-orange-600">
                          {product.points} pts
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No products found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Product Modal */}
        {showAddModal && (
          <ProductModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              fetchProducts();
              fetchProductStats();
              setShowAddModal(false);
            }}
          />
        )}

        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <ProductModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            product={selectedProduct}
            onSuccess={() => {
              fetchProducts();
              fetchProductStats();
              setShowEditModal(false);
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Delete Product
              </DialogTitle>
              <DialogDescription>
                Choose an action:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li><strong>Deactivate</strong> – Safest option. Keeps product for history but prevents new use.</li>
                  <li><strong>Delete permanently</strong> – Irreversible. Removes product and all associated valid serials.</li>
                </ul>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="w-full flex flex-col sm:flex-row sm:justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="outline" onClick={() => confirmDelete(false)}>Deactivate</Button>
                <Button className="bg-red-600 hover:bg-red-700" onClick={() => confirmDelete(true)}>
                  Delete permanently
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminProducts;
