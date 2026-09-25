const productService = require('../services/productService');
const { deleteImageFile } = require('../middleware/upload');
const { generateEmbedding } = require('../services/embeddingService');
// Regex for UUID v4 / generic UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Helper to generate 512-d CLIP embedding for an uploaded product image.
 * Safely cleans up the uploaded file and sends appropriate error response on failure.
 */
const generateProductEmbedding = async (file, res) => {
  try {
    const embeddedImage = await generateEmbedding(file.path);
    return { embedding: JSON.stringify(embeddedImage) };
  } catch (embErr) {
    deleteImageFile(`/uploads/products/${file.filename}`);

    if (
      embErr.code === 'ECONNREFUSED' ||
      embErr.code === 'ENOTFOUND' ||
      embErr.message?.includes('Embedding service unavailable') ||
      embErr.message?.includes('ECONNREFUSED')
    ) {
      res.status(503).json({
        success: false,
        message: 'Embedding service is unavailable. Please ensure the Python CLIP service is running.'
      });
      return { handled: true };
    }

    if (embErr.message && embErr.message.includes('Invalid embedding dimensions')) {
      res.status(502).json({
        success: false,
        message: embErr.message
      });
      return { handled: true };
    }

    res.status(500).json({
      success: false,
      message: embErr.message || 'Failed to generate image embedding.'
    });
    return { handled: true };
  }
};

class ProductController {
  /**
   * POST /api/products
   */
  async createProduct(req, res, next) {
    try {
      const { name, description, category, price } = req.body;

      if (!name || name.trim() === '') {
        if (req.file) {
          deleteImageFile(`/uploads/products/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: 'Product name is required'
        });
      }

      if (price === undefined || price === null || price === '' || isNaN(Number(price))) {
        if (req.file) {
          deleteImageFile(`/uploads/products/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: 'Valid product price is required'
        });
      }

      let embedding = null;
      if (req.file) {
        const embResult = await generateProductEmbedding(req.file, res);
        if (embResult.handled) {
          return;
        }
        embedding = embResult.embedding;
      }

      const imageUrl = req.file ? `/uploads/products/${req.file.filename}` : null;
      const product = await productService.createProduct({
        name: name.trim(),
        description: description ? description.trim() : null,
        category: category ? category.trim() : null,
        price: parseFloat(price),
        imageUrl,
        embedding
      });

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      if (req.file) {
        deleteImageFile(`/uploads/products/${req.file.filename}`);
      }
      next(error);
    }
  }

  /**
   * GET /api/products
   */
  async getAllProducts(req, res, next) {
    try {
      const { page, limit, category } = req.query;

      const result = await productService.getAllProducts({
        page,
        limit,
        category
      });

      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      if (!UUID_REGEX.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format. Must be a valid UUID.'
        });
      }

      const product = await productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!UUID_REGEX.test(id)) {
        if (req.file) {
          deleteImageFile(`/uploads/products/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format. Must be a valid UUID.'
        });
      }

      const { name, description, category, price } = req.body;

      if (price !== undefined && price !== '' && isNaN(Number(price))) {
        if (req.file) {
          deleteImageFile(`/uploads/products/${req.file.filename}`);
        }
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid number'
        });
      }

      // Check if product exists before generating embedding to avoid wasted inference
      const existingProduct = await productService.getProductById(id);
      if (!existingProduct) {
        if (req.file) {
          deleteImageFile(`/uploads/products/${req.file.filename}`);
        }
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      let embedding = undefined;
      if (req.file) {
        const embResult = await generateProductEmbedding(req.file, res);
        if (embResult.handled) {
          return;
        }
        embedding = embResult.embedding;
      }

      const updatedProduct = await productService.updateProduct(
        id,
        {
          name: name !== undefined ? name.trim() : undefined,
          description: description !== undefined ? description.trim() : undefined,
          category: category !== undefined ? category.trim() : undefined,
          price: price !== undefined && price !== '' ? parseFloat(price) : undefined,
          embedding
        },
        req.file
      );

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      if (req.file) {
        deleteImageFile(`/uploads/products/${req.file.filename}`);
      }
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      if (!UUID_REGEX.test(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID format. Must be a valid UUID.'
        });
      }

      const deleted = await productService.deleteProduct(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
