import React from 'react';
import { X, Tag, DollarSign, Calendar, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../services/productService';

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '580px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 className="modal-title" style={{ margin: 0 }}>Product Details</h3>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-subtle)', textAlign: 'center' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="image-placeholder"
            style={{
              display: imageUrl ? 'none' : 'flex',
              padding: '3rem 1rem'
            }}
          >
            <ImageIcon size={48} />
            <span>No image provided</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {product.name}
            </h4>
            {product.category && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                background: 'var(--color-primary-light)',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-full)',
                marginTop: '0.35rem'
              }}>
                <Tag size={12} />
                {product.category}
              </span>
            )}
          </div>

          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            ${parseFloat(product.price).toFixed(2)}
          </div>

          {product.description && (
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Description
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                {product.description}
              </p>
            </div>
          )}

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div><strong>ID:</strong> {product.id}</div>
            {product.createdAt && (
              <div><strong>Created:</strong> {new Date(product.createdAt).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
