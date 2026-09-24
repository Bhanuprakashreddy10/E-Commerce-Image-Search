# Backend - E-Commerce Product CRUD (Node.js & Express)

This service provides RESTful APIs for managing e-commerce products with PostgreSQL and local image upload support.

## Architecture

```
HTTP Request
     │
     ▼
Express Route (routes/productRoutes.js)
     │
     ▼
Multer Middleware (middleware/upload.js) -> Stores file in uploads/products/
     │
     ▼
Controller (controllers/productController.js) -> Validates input & formats response
     │
     ▼
Service (services/productService.js) -> Business logic & file cleanup
     │
     ▼
Sequelize Model (models/Product.js)
     │
     ▼
PostgreSQL Table (products)
```

## Prerequisites

- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+
- **PostgreSQL**: PostgreSQL 18 running on `localhost:5432` with database `visual_search_db`

## Environment Variables

Create `.env` in `backend-node/`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=visual_search_db
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
```

## Installation & Running

```bash
# Install dependencies
npm install

# Start in development mode (with nodemon)
npm run dev

# Start in production mode
npm start
```

Upon startup, the server automatically verifies the database, tests the connection (`Database connected successfully`), and synchronizes the Sequelize `products` schema.

## API Endpoints

| Method | Endpoint | Description | Content-Type |
|---|---|---|---|
| `GET` | `/api/health` | Health check endpoint | `application/json` |
| `POST` | `/api/products` | Create a new product (supports image upload) | `multipart/form-data` |
| `GET` | `/api/products` | Get paginated products (`?page=1&limit=10&category=Shoes`) | `application/json` |
| `GET` | `/api/products/:id` | Get single product by UUID | `application/json` |
| `PUT` | `/api/products/:id` | Update product details and/or replace image | `multipart/form-data` |
| `DELETE` | `/api/products/:id` | Delete product and remove its image file | `application/json` |

## Image Upload & Static Serving

- Uploaded files are stored in `backend-node/uploads/products/`.
- File naming convention: `product-<uuid>.<ext>`.
- Allowed file types: `.jpg`, `.jpeg`, `.png`, `.webp` (max 5MB).
- Static access URL: `http://localhost:5000/uploads/products/<filename>`.
- Old images are automatically cleaned up when updated or deleted.
