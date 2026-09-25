const Product = require('../models/Product');
const { deleteImageFile } = require('../middleware/upload');

class ProductService {
  /**
   * Create a new product
   * @param {Object} data - { name, description, category, price, imageUrl }
   */
  async createProduct({ name, description, category, price, imageUrl, embedding }) {
    const product = await Product.create({
      name,
      description: description || null,
      category: category || null,
      price,
      image_url: imageUrl || null,
      embedding: embedding || null,
    });

    return product;
  }

  /**
   * Get paginated products with optional category filter
   * @param {Object} query - { page, limit, category }
   */
  async getAllProducts({ page = 1, limit = 10, category }) {
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (parsedPage - 1) * parsedLimit;

    const whereClause = {};
    if (category && category.trim() !== '') {
      whereClause.category = category.trim();
    }

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      limit: parsedLimit,
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      products: rows,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: count,
        totalPages: Math.ceil(count / parsedLimit) || 1
      }
    };
  }

  /**
   * Get product by ID
   * @param {string} id - Product UUID
   */
  async getProductById(id) {
    const product = await Product.findByPk(id);
    return product;
  }

  /**
   * Update an existing product
   * @param {string} id - Product UUID
   * @param {Object} data - { name, description, category, price }
   * @param {Object|null} file - Multer file object if a new image was uploaded
   */
  async updateProduct(id, { name, description, category, price, embedding }, file) {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (category !== undefined) updatePayload.category = category;
    if (price !== undefined) updatePayload.price = price;
    if (embedding !== undefined) updatePayload.embedding = embedding;
    if (file) {
      const oldImageUrl = product.image_url;
      const newImageUrl = `/uploads/products/${file.filename}`;
      updatePayload.image_url = newImageUrl;

      // Safely delete old image
      if (oldImageUrl) {
        deleteImageFile(oldImageUrl);
      }
    }
    await product.update(updatePayload);
    return product;
  }

  /**
   * Delete product by ID and remove its local image file
   * @param {string} id - Product UUID
   */
  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      return false;
    }

    // Safely delete associated image from disk
    if (product.image_url) {
      deleteImageFile(product.image_url);
    }

    await product.destroy();
    return true;
  }
}

module.exports = new ProductService();
