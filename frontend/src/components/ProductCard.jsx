import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Eye, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../services/productService';

export default function ProductCard({ product, onDelete, onView }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getImageUrl(product.image_url);

  return (
    <div className="product-card">
      <div className="product-image-wrap">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <ImageIcon size={32} />
            <span>No Image</span>
          </div>
        )}

        {product.category && (
          <span className="category-badge">{product.category}</span>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        <p className="product-desc">
          {product.description || 'No description provided.'}
        </p>

        <div className="product-footer">
          <span className="product-price">
            ${parseFloat(product.price).toFixed(2)}
          </span>

          <div className="product-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              title="View details"
              onClick={() => onView(product)}
            >
              <Eye size={14} />
            </button>
            <Link
              to={`/products/${product.id}/edit`}
              className="btn btn-secondary btn-sm"
              title="Edit product"
            >
              <Edit2 size={14} />
            </Link>
            <button
              type="button"
              className="btn btn-danger-outline btn-sm"
              title="Delete product"
              onClick={() => onDelete(product)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
