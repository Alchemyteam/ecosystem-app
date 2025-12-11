import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { getToken } from '../services/api';
import { SalesData } from '../types/salesData';
import {
  getSalesData,
  createSalesData,
  updateSalesData,
  deleteSalesData,
  bulkImportSalesData,
} from '../services/salesDataApi';
import { downloadExcelTemplate } from '../services/salesDataApi';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Upload,
  CheckCircle2,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const SalesDataManagementPage: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<SalesData | null>(null);
  const [formData, setFormData] = useState<Partial<SalesData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<SalesData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Excel upload state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    processed: number;
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: Please login first');
      }

      const params: any = {
        page: currentPage,
        limit,
        sort: 'newest',
      };

      if (searchTerm && searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }

      const response = await getSalesData(params, token);
      setSalesData(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to fetch data. Please try again.');
      setSalesData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData();
  };

  // Open add form
  const handleAdd = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({});
    setIsFormOpen(true);
  };

  // Open edit form
  const handleEdit = (item: SalesData) => {
    setIsEditMode(true);
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  // Close form
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({});
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: Please login first');
      }

      if (isEditMode && editingItem?.TXNo) {
        await updateSalesData(editingItem.TXNo, formData, token);
      } else {
        await createSalesData(formData, token);
      }

      handleCloseForm();
      fetchData();
    } catch (err) {
      console.error('Error saving sales data:', err);
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (item: SalesData) => {
    setItemToDelete(item);
    setDeleteConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete?.TXNo) return;

    setIsDeleting(true);
    setError('');

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Unauthorized: Please login first');
      }

      await deleteSalesData(itemToDelete.TXNo, token);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (err) {
      console.error('Error deleting sales data:', err);
      const apiError = err as { message?: string };
      setError(apiError.message || 'Failed to delete. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Format price
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
              <Link to="/buyer" className="hover:text-brand-600">
                Buyer Portal
              </Link>
              <span>/</span>
              <span className="text-slate-900">Sales Data Management</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Database className="text-brand-600" size={28} />
                  Sales Data Management
                </h1>
                <p className="text-slate-600">Manage and maintain sales data</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      const token = getToken();
                      if (!token) {
                        setError('Unauthorized: Please login first');
                        return;
                      }
                      await downloadExcelTemplate(token);
                    } catch (err) {
                      console.error('Error downloading template:', err);
                      const apiError = err as { message?: string };
                      setError(apiError.message || 'Failed to download template. Please try again.');
                    }
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Download size={18} />
                  Download Template
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Upload size={18} />
                  Upload Excel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Data
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by transaction number, product name, product code..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-brand-600" size={32} />
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Transaction Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Transaction No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Product Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Product Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Buyer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {salesData.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                            No data available
                          </td>
                        </tr>
                      ) : (
                        salesData.map((item, index) => (
                          <tr key={`${item.TXNo}-${index}`} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(item.TXDate)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {item.TXNo || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-900">
                              {item.ItemName || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {item.ItemCode || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {item.BuyerName || 'N/A'}
                              {item.BuyerCode && (
                                <span className="text-xs text-slate-500 ml-1">({item.BuyerCode})</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {item.TXQty || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                              {formatPrice(item.TXP1)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                  <Edit size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl border border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    Showing {salesData.length > 0 ? (currentPage - 1) * limit + 1 : 0} to{' '}
                    {Math.min(currentPage * limit, total)} of {total} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="First page"
                    >
                      <ChevronsLeft size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-brand-600 text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next page"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Last page"
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {isEditMode ? 'Edit Data' : 'Add Data'}
              </h2>
              <button
                onClick={handleCloseForm}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Date */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction Date (TXDate)
                  </label>
                  <input
                    type="date"
                    value={formData.TXDate || ''}
                    onChange={(e) => setFormData({ ...formData, TXDate: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Transaction Number */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction Number (TXNo) *
                  </label>
                  <input
                    type="text"
                    value={formData.TXNo || ''}
                    onChange={(e) => setFormData({ ...formData, TXNo: e.target.value || null })}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Transaction Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction Quantity (TXQty)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.TXQty || ''}
                    onChange={(e) => setFormData({ ...formData, TXQty: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Transaction Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Transaction Price (TXP1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.TXP1 || ''}
                    onChange={(e) => setFormData({ ...formData, TXP1: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Buyer Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Buyer Code (BuyerCode)
                  </label>
                  <input
                    type="text"
                    value={formData.BuyerCode || ''}
                    onChange={(e) => setFormData({ ...formData, BuyerCode: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Buyer Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Buyer Name (BuyerName)
                  </label>
                  <input
                    type="text"
                    value={formData.BuyerName || ''}
                    onChange={(e) => setFormData({ ...formData, BuyerName: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Item Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Item Code (ItemCode)
                  </label>
                  <input
                    type="text"
                    value={formData.ItemCode || ''}
                    onChange={(e) => setFormData({ ...formData, ItemCode: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Item Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Item Name (ItemName)
                  </label>
                  <input
                    type="text"
                    value={formData.ItemName || ''}
                    onChange={(e) => setFormData({ ...formData, ItemName: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Product Hierarchy 3 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Product Hierarchy 3
                  </label>
                  <input
                    type="text"
                    value={formData['Product Hierarchy 3'] || ''}
                    onChange={(e) => setFormData({ ...formData, 'Product Hierarchy 3': e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Item Type */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Item Type (ItemType)
                  </label>
                  <input
                    type="text"
                    value={formData.ItemType || ''}
                    onChange={(e) => setFormData({ ...formData, ItemType: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    value={formData.Model || ''}
                    onChange={(e) => setFormData({ ...formData, Model: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Material */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    value={formData.Material || ''}
                    onChange={(e) => setFormData({ ...formData, Material: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* UOM */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    UOM (Unit of Measure)
                  </label>
                  <input
                    type="text"
                    value={formData.UOM || ''}
                    onChange={(e) => setFormData({ ...formData, UOM: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Brand Code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Brand Code
                  </label>
                  <input
                    type="text"
                    value={formData['Brand Code'] || ''}
                    onChange={(e) => setFormData({ ...formData, 'Brand Code': e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Unit Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData['Unit Cost'] || ''}
                    onChange={(e) => setFormData({ ...formData, 'Unit Cost': e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sector
                  </label>
                  <input
                    type="text"
                    value={formData.Sector || ''}
                    onChange={(e) => setFormData({ ...formData, Sector: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Sub Sector */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Sub Sector (SubSector)
                  </label>
                  <input
                    type="text"
                    value={formData.SubSector || ''}
                    onChange={(e) => setFormData({ ...formData, SubSector: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.Value || ''}
                    onChange={(e) => setFormData({ ...formData, Value: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Function */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Function
                  </label>
                  <input
                    type="text"
                    value={formData.Function || ''}
                    onChange={(e) => setFormData({ ...formData, Function: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Performance */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Performance
                  </label>
                  <input
                    type="text"
                    value={formData.Performance || ''}
                    onChange={(e) => setFormData({ ...formData, Performance: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Performance.1 */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Performance.1
                  </label>
                  <input
                    type="text"
                    value={formData['Performance.1'] || ''}
                    onChange={(e) => setFormData({ ...formData, 'Performance.1': e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Rationale */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Rationale
                  </label>
                  <input
                    type="text"
                    value={formData.Rationale || ''}
                    onChange={(e) => setFormData({ ...formData, Rationale: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Website (www)
                  </label>
                  <input
                    type="url"
                    value={formData.www || ''}
                    onChange={(e) => setFormData({ ...formData, www: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Source
                  </label>
                  <input
                    type="text"
                    value={formData.Source || ''}
                    onChange={(e) => setFormData({ ...formData, Source: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Upload Excel File</h2>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadProgress(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {!uploadProgress ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-slate-600 mb-4">
                      Please upload an Excel file (.xlsx) that matches the template format. 
                      Make sure to download the template first to ensure correct column headers.
                    </p>
                    <label className="block">
                      <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-brand-500 transition-colors cursor-pointer">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-slate-400" />
                          <div className="flex text-sm text-slate-600">
                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-brand-600 hover:text-brand-500 focus-within:outline-none">
                              Click to upload
                              <input
                                type="file"
                                accept=".xlsx,.xls"
                                className="sr-only"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  setIsUploading(true);
                                  setError('');

                                  try {
                                    const token = getToken();
                                    if (!token) {
                                      throw new Error('Unauthorized: Please login first');
                                    }

                                    // 显示上传进度（初始状态）
                                    setUploadProgress({
                                      total: 100,
                                      processed: 0,
                                      success: 0,
                                      failed: 0,
                                      errors: [],
                                    });

                                    // 直接上传文件到后端
                                    const result = await bulkImportSalesData(file, token);

                                    // 更新进度
                                    setUploadProgress({
                                      total: result.success + result.failed,
                                      processed: result.success + result.failed,
                                      success: result.success,
                                      failed: result.failed,
                                      errors: result.errors,
                                    });

                                    // 刷新数据列表
                                    await fetchData();
                                  } catch (err) {
                                    console.error('Error uploading file:', err);
                                    const apiError = err as { message?: string };
                                    setError(apiError.message || 'Failed to upload file. Please try again.');
                                  } finally {
                                    setIsUploading(false);
                                  }
                                }}
                                disabled={isUploading}
                              />
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500">Excel files only (.xlsx, .xls)</p>
                        </div>
                      </div>
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        setUploadProgress(null);
                      }}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Upload Progress</span>
                      <span className="text-sm text-slate-600">
                        {uploadProgress.processed} / {uploadProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="text-green-600" size={20} />
                        <span className="text-sm font-medium text-green-700">Success</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{uploadProgress.success}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="text-red-600" size={20} />
                        <span className="text-sm font-medium text-red-700">Failed</span>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{uploadProgress.failed}</p>
                    </div>
                  </div>

                  {uploadProgress.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
                      <ul className="text-xs text-red-600 space-y-1">
                        {uploadProgress.errors.slice(0, 10).map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                        {uploadProgress.errors.length > 10 && (
                          <li className="text-red-500">... and {uploadProgress.errors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setIsUploadModalOpen(false);
                        setUploadProgress(null);
                        fetchData();
                      }}
                      className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Delete</h3>
            </div>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete the data with transaction number <span className="font-semibold text-slate-900">{itemToDelete?.TXNo}</span>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesDataManagementPage;

