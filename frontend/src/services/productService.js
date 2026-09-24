import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json'
  }
});

// Helper to resolve full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Ensure leading slash
  const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BACKEND_URL}${formattedPath}`;
};

export const productService = {
  /**
   * Get all products with pagination and category filter
   */
  async getAllProducts({ page = 1, limit = 8, category = '' } = {}) {
    const params = { page, limit };
    if (category && category !== 'All') {
      params.category = category;
    }
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  /**
   * Create a new product
   * Accepts FormData with name, description, category, price, and optional image
   */
  async createProduct(formData) {
    const response = await apiClient.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Update a product by ID
   * Accepts FormData
   */
  async updateProduct(id, formData) {
    const response = await apiClient.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Delete a product by ID
   */
  async deleteProduct(id) {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  }
};

export default productService;
