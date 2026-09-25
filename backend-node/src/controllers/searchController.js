const path = require('path');
const fs = require('fs');
const searchService = require('../services/searchService');
const { generateEmbedding } = require('../services/embeddingService');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Safely delete temporary search image from disk
 * @param {string} filePath - Absolute path to temporary file
 */
const safeDeleteTempFile = (filePath) => {
  if (!filePath || typeof filePath !== 'string') return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.warn(`Failed to delete temporary search image (${filePath}):`, err.message);
  }
};

class SearchController {
  /**
   * POST /api/search/visual
   * Perform visual search by query image
   */
  async visualSearch(req, res, next) {
    const tempFilePath = req.file ? req.file.path : null;

    try {
      // 1. Validate that an image was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'An image file is required in the "file" field.'
        });
      }

      // 2. Validate allowed file extension and MIME type
      const ext = path.extname(req.file.originalname).toLowerCase();
      const mime = (req.file.mimetype || '').toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(mime)) {
        safeDeleteTempFile(tempFilePath);
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.'
        });
      }

      // 3. Validate optional limit parameter (default: 10, max: 20)
      let limit = 10;
      if (req.query.limit !== undefined) {
        const rawLimit = String(req.query.limit).trim();
        const parsedLimit = Number(rawLimit);

        if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 20) {
          safeDeleteTempFile(tempFilePath);
          return res.status(400).json({
            success: false,
            message: 'Invalid limit parameter. Limit must be an integer between 1 and 20.'
          });
        }
        limit = parsedLimit;
      }

      // 4. Generate 512-dimensional embedding using Python CLIP service
      let embedding;
      try {
        embedding = await generateEmbedding(tempFilePath);
      } catch (embErr) {
        safeDeleteTempFile(tempFilePath);

        if (
          embErr.code === 'ECONNREFUSED' ||
          embErr.code === 'ENOTFOUND' ||
          embErr.message?.includes('Embedding service unavailable') ||
          embErr.message?.includes('ECONNREFUSED')
        ) {
          return res.status(503).json({
            success: false,
            message: 'Embedding service is unavailable. Please ensure the Python CLIP service is running.'
          });
        }

        if (embErr.message && embErr.message.includes('Invalid embedding dimensions')) {
          return res.status(502).json({
            success: false,
            message: embErr.message
          });
        }

        return res.status(500).json({
          success: false,
          message: embErr.message || 'Failed to generate image embedding.'
        });
      }

      // 5. Always clean up temporary search image immediately after embedding generation
      safeDeleteTempFile(tempFilePath);

      // 6. Validate that the embedding contains exactly 512 values
      if (!Array.isArray(embedding) || embedding.length !== 512) {
        return res.status(502).json({
          success: false,
          message: `Invalid embedding dimensions. Expected exactly 512 values, received ${
            Array.isArray(embedding) ? embedding.length : 0
          }.`
        });
      }

      // 7. Perform PostgreSQL pgvector similarity search
      const matchingProducts = await searchService.searchByVisualSimilarity(embedding, limit);

      // 8. Return results
      return res.status(200).json({
        success: true,
        data: matchingProducts
      });
    } catch (error) {
      // Ensure temp file is deleted on any unexpected error
      safeDeleteTempFile(tempFilePath);
      next(error);
    }
  }
}

module.exports = new SearchController();
