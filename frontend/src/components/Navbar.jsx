import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Plus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Package size={20} />
          </div>
          <span>Visual Shop Catalog</span>
        </Link>

        <div className="navbar-links">
          <Link
            to="/"
            className={`btn ${location.pathname === '/' ? 'btn-secondary' : 'btn-secondary'}`}
          >
            All Products
          </Link>
          <Link to="/products/new" className="btn btn-primary">
            <Plus size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
