import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import productService from '../services/productService';
import ProductList from '../components/ProductList';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductDetailModal from '../components/ProductDetailModal';

const CATEGORIES = ['All', 'Shoes', 'Electronics', 'Clothing', 'Accessories', 'Home & Kitchen'];

export default function ProductsPage() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // Delete modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View modal state
  const [productToView, setProductToView] = useState(null);

  // Fetch products
  const fetchProducts = useCallback(async (page = 1, category = selectedCategory) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getAllProducts({
        page,
        limit: 8,
        category: category === 'All' ? '' : category
      });

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchProducts(1, selectedCategory);
  }, [selectedCategory, fetchProducts]);

  // Clear flash message after 4s
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handlePageChange = (newPage) => {
    fetchProducts(newPage, selectedCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Delete handling
  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      setSuccessMessage(`"${productToDelete.name}" deleted successfully.`);
      setProductToDelete(null);
      // Refresh list
      fetchProducts(pagination.page, selectedCategory);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">
            Manage your store's inventory, prices, and product imagery
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fetchProducts(pagination.page, selectedCategory)}
            title="Refresh list"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
          <Link to="/products/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Create Product</span>
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="filter-bar">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Filter Category:
        </span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategorySelect(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <ProductList
          products={products}
          pagination={pagination}
          onPageChange={handlePageChange}
          onDelete={handleDeleteClick}
          onView={(product) => setProductToView(product)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action will also delete the associated image.`}
        confirmLabel="Delete Product"
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={productToView}
        onClose={() => setProductToView(null)}
      />
    </div>
  );
}
