# Frontend - E-Commerce Product Management (React + Vite)

A modern, responsive Product Management UI built with React, Vite, and Axios for managing e-commerce catalog products and uploading product images.

## Features

- **Product Listing**: Responsive grid displaying product image cards with category badges, price, and actions.
- **Pagination & Filters**: Server-side pagination controls and category filter pills.
- **Product Creation**: Form with validation, price formatting, and live image file preview.
- **Product Edit**: Pre-loaded product details with image replacement capability.
- **Product Deletion**: Modal confirmation dialog preventing accidental deletions.
- **Product Details Modal**: Modal view displaying high-resolution image, specifications, and metadata.
- **Instant Feedback**: Toast notifications and alerts for create, update, and delete actions.

## Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- Backend running on `http://localhost:5000`

## Environment Variables

Create `.env` in `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The application runs by default at `http://localhost:5173`.
