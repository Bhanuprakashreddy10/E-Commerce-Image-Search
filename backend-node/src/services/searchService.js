const { sequelize } = require('../config/database');
const { QueryTypes } = require('sequelize');

class SearchService {
  /**
   * Search products by image embedding cosine similarity using pgvector
   * @param {Array<number>} embedding - 512-dimensional embedding array
   * @param {number} limit - Maximum number of matching products to return
   * @returns {Promise<Array<Object>>} Matching products with similarity score
   */
  async searchByVisualSimilarity(embedding, limit = 10) {
    const vectorStr = Array.isArray(embedding)
      ? JSON.stringify(embedding)
      : embedding;

    const query = `
      SELECT
          id,
          name,
          description,
          category,
          price,
          image_url,
          1 - (embedding <=> :embedding) AS similarity
      FROM products
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> :embedding
      LIMIT :limit;
    `;

    const results = await sequelize.query(query, {
      replacements: {
        embedding: vectorStr,
        limit
      },
      type: QueryTypes.SELECT
    });

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      price: row.price,
      image_url: row.image_url,
      similarity:
        row.similarity !== null && row.similarity !== undefined
          ? parseFloat(Number(row.similarity).toFixed(4))
          : null
    }));
  }
}

module.exports = new SearchService();
