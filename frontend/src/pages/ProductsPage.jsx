import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Camera,
  X,
  ArrowLeft
} from 'lucide-react';
import productService from '../services/productService';
import ProductList from '../components/ProductList';
import ConfirmDialog from '../components/ConfirmDialog';
import ProductDetailModal from '../components/ProductDetailModal';
import VisualSearchModal from '../components/VisualSearchModal';

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

  // Visual search state
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [isVisualSearchActive, setIsVisualSearchActive] = useState(false);
  const [visualSearchResults, setVisualSearchResults] = useState([]);
  const [visualQueryInfo, setVisualQueryInfo] = useState(null); // { previewUrl, fileName }

  // Fetch products (default catalog)
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
    if (!isVisualSearchActive) {
      fetchProducts(1, selectedCategory);
    }
  }, [selectedCategory, fetchProducts, isVisualSearchActive]);

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

  // Handle visual search completion
  const handleVisualSearchResults = (results, previewUrl, fileName) => {
    setVisualSearchResults(results);
    setVisualQueryInfo({ previewUrl, fileName });
    setIsVisualSearchActive(true);
    setError(null);
    setSuccessMessage(`Visual search completed! Found ${results.length} visually matching products.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear visual search and return to default catalog
  const handleClearVisualSearch = () => {
    setIsVisualSearchActive(false);
    setVisualSearchResults([]);
    setVisualQueryInfo(null);
    fetchProducts(1, selectedCategory);
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

      if (isVisualSearchActive) {
        setVisualSearchResults((prev) => prev.filter((p) => p.id !== productToDelete.id));
      } else {
        fetchProducts(pagination.page, selectedCategory);
      }
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
          <h1 className="page-title">
            {isVisualSearchActive ? 'Visual Search Results' : 'Product Catalog'}
          </h1>
          <p className="page-subtitle">
            {isVisualSearchActive
              ? 'Products ranked by cosine similarity to your uploaded query image'
              : "Manage your store's inventory, prices, and product imagery"}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search by Image Button */}
          <button
            type="button"
            className="btn btn-visual-search"
            onClick={() => setIsVisualSearchOpen(true)}
            title="Search for products using an image"
          >
            <Camera size={16} />
            <span>Search by Image</span>
          </button>

          {!isVisualSearchActive ? (
            <>
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
            </>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClearVisualSearch}
              title="Return to all products"
            >
              <ArrowLeft size={16} />
              <span>Back to Catalog</span>
            </button>
          )}
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

      {/* Visual Search Active Banner */}
      {isVisualSearchActive && visualQueryInfo && (
        <div className="visual-search-banner">
          <div className="query-image-col">
            <div className="query-thumbnail-wrap">
              <img
                src={visualQueryInfo.previewUrl}
                alt="Query Thumbnail"
                className="query-thumbnail"
              />
              <span className="query-badge">Query Image</span>
            </div>
            <div className="query-info">
              <h4>Searching by Image</h4>
              <p className="query-filename">{visualQueryInfo.fileName}</p>
              <p className="query-stats">
                {visualSearchResults.length} {visualSearchResults.length === 1 ? 'match' : 'matches'} found • AI CLIP Cosine Similarity
              </p>
            </div>
          </div>

          <div className="banner-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsVisualSearchOpen(true)}
            >
              <Camera size={14} />
              <span>Try Another Image</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleClearVisualSearch}
            >
              <X size={14} />
              <span>Clear Search</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Filter Pills (only when not in visual search) */}
      {!isVisualSearchActive && (
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
      )}

      {/* Product Grid / Loading */}
      {isLoading && !isVisualSearchActive ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : (
        <ProductList
          products={isVisualSearchActive ? visualSearchResults : products}
          pagination={
            isVisualSearchActive
              ? { page: 1, totalPages: 1, total: visualSearchResults.length }
              : pagination
          }
          onPageChange={handlePageChange}
          onDelete={handleDeleteClick}
          onView={(product) => setProductToView(product)}
        />
      )}

      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={isVisualSearchOpen}
        onClose={() => setIsVisualSearchOpen(false)}
        onSearchResults={handleVisualSearchResults}
      />

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
