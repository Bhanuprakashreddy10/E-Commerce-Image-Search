const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const productRoutes = require('./routes/productRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files
// e.g. http://localhost:5000/uploads/products/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend API is running smoothly'
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);

// Catch 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err.message || err);

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum allowed size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Malformed form-data or stream error
  if (err.message && (err.message.includes('Unexpected end of form') || err.message.includes('Multipart: Boundary not found'))) {
    return res.status(400).json({
      success: false,
      message: 'Malformed form-data or unexpected end of upload.'
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map((e) => e.message).join(', ');
    return res.status(400).json({
      success: false,
      message: messages || 'Validation error'
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'A record with that value already exists'
    });
  }

  // Custom status code or 500
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    message
  });
});

module.exports = app;
