import React, { useState, useEffect } from 'react';
import { UploadCloud, X, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../services/productService';

const COMMON_CATEGORIES = [
  'Electronics',
  'Shoes',
  'Clothing',
  'Accessories',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Books'
];

export default function ProductForm({
  initialData = null,
  isEdit = false,
  isLoading = false,
  onSubmit,
  error = null
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Populate data when in edit mode
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
      setPrice(initialData.price !== undefined ? initialData.price.toString() : '');
      if (initialData.image_url) {
        setPreviewUrl(getImageUrl(initialData.image_url));
      }
    }
  }, [initialData]);

  // Clean up object URL when new file preview changes
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Image size must be less than 5MB');
      return;
    }

    // Validate type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setValidationError('Only JPG, JPEG, PNG, and WEBP formats are supported');
      return;
    }

    setValidationError('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Product name is required');
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      setValidationError('Please enter a valid price (0 or greater)');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('category', category.trim());
    formData.append('price', price);

    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    onSubmit(formData);
  };

  return (
    <div className="form-card">
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to="/" className="btn btn-secondary btn-sm" title="Back to products">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {isEdit ? 'Update product information and image' : 'Fill in the details below to add a product'}
          </p>
        </div>
      </div>

      {(validationError || error) && (
        <div className="alert alert-error">
          <span>{validationError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="product-name">
            Product Name <span className="required">*</span>
          </label>
          <input
            id="product-name"
            type="text"
            className="form-control"
            placeholder="e.g. Nike Air Max 90"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="product-category">
              Category
            </label>
            <input
              id="product-category"
              type="text"
              list="category-suggestions"
              className="form-control"
              placeholder="Select or enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            />
            <datalist id="category-suggestions">
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="product-price">
              Price ($) <span className="required">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              min="0"
              className="form-control"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-description">
            Description
          </label>
          <textarea
            id="product-description"
            className="form-control"
            placeholder="Enter product details, specifications, features..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isLoading}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Product Image</label>
          <div className="file-dropzone">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <div className="dropzone-content">
              <UploadCloud size={32} style={{ color: 'var(--color-primary)' }} />
              <div>
                <strong>Click to browse</strong> or drag & drop image
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supports JPG, PNG, WEBP up to 5MB
              </div>
            </div>
          </div>

          {previewUrl && (
            <div className="preview-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
              <button
                type="button"
                className="preview-remove-btn"
                title="Remove image preview"
                onClick={handleRemoveImage}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Link to="/" className="btn btn-secondary" disabled={isLoading}>
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
