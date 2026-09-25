import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react';
import productService from '../services/productService';

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function VisualSearchModal({ isOpen, onClose, onSearchResults }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [limit, setLimit] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  const handleClear = useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsSearching(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      handleClear();
    }
  }, [isOpen, handleClear]);

  if (!isOpen) return null;

  const validateAndSetFile = (file) => {
    setError(null);
    if (!file) return;

    // Check extension
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    // Check size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    // Revoke previous blob url
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select or drop an image first.');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await productService.searchByImage(selectedFile, limit);
      if (response.success) {
        onSearchResults(response.data, previewUrl, selectedFile.name);
        onClose();
      } else {
        setError(response.message || 'Visual search failed. Please try again.');
      }
    } catch (err) {
      console.error('Visual search error:', err);
      const apiError =
        err.response?.data?.message ||
        (err.code === 'ECONNREFUSED'
          ? 'Visual Search backend or embedding service is currently unreachable.'
          : err.message || 'Failed to complete visual search.');
      setError(apiError);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content visual-search-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="search-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: '1.2rem' }}>Visual Product Search</h3>
              <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Find visually matching items using AI CLIP embeddings
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close"
            disabled={isSearching}
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem', padding: '0.75rem 0.9rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!previewUrl ? (
            <div
              className={`file-dropzone visual-search-dropzone ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="dropzone-content">
                <div className="dropzone-icon-circle">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                    Click to upload or drag & drop image
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    JPG, PNG, or WEBP (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="visual-preview-box">
              <div className="preview-image-container">
                <img src={previewUrl} alt="Query Preview" className="visual-query-preview" />
                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={handleClear}
                  title="Remove image"
                  disabled={isSearching}
                >
                  <X size={14} />
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedFile?.name}
                </span>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(selectedFile?.size / 1024).toFixed(1)} KB • Ready to search
                </span>
              </div>
            </div>
          )}

          {/* Options: Limit */}
          <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <SlidersHorizontal size={15} />
              <span>Max Results Limit</span>
            </div>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={isSearching}
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10 (Default)</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20 (Max)</option>
            </select>
          </div>

          {isSearching && (
            <div style={{ marginTop: '1.25rem', textAlign: 'center', padding: '1rem', background: 'var(--color-primary-light)', borderRadius: 'var(--radius-md)' }}>
              <div className="spinner" style={{ width: '28px', height: '28px', margin: '0 auto 0.5rem auto' }}></div>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                Analyzing image features & searching similarity...
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Comparing 512-D CLIP embeddings with vector database
              </p>
            </div>
          )}

          <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSearching}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!selectedFile || isSearching}
              style={{ minWidth: '150px' }}
            >
              <Sparkles size={16} />
              <span>{isSearching ? 'Searching...' : 'Find Matches'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
