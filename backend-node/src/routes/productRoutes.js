const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload } = require('../middleware/upload');

// Create product (with optional image)
router.post('/', upload.single('image'), (req, res, next) => {
  productController.createProduct(req, res, next);
});

// Get all products (with pagination & category filter)
router.get('/', (req, res, next) => {
  productController.getAllProducts(req, res, next);
});

// Get single product by id
router.get('/:id', (req, res, next) => {
  productController.getProductById(req, res, next);
});

// Update product (with optional new image)
router.put('/:id', upload.single('image'), (req, res, next) => {
  productController.updateProduct(req, res, next);
});

// Delete product by id
router.delete('/:id', (req, res, next) => {
  productController.deleteProduct(req, res, next);
});

module.exports = router;
