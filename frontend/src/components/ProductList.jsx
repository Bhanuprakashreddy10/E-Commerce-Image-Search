import React from 'react';
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductList({
  products = [],
  pagination = { page: 1, totalPages: 1 },
  onPageChange,
  onDelete,
  onView
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <PackageOpen size={30} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            No products found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            There are no products matching your selected criteria.
          </p>
        </div>
      </div>
    );
  }

  const { page, totalPages, total } = pagination;

  return (
    <div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="page-indicator">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} items)
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
