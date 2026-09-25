const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { upload } = require('../middleware/upload');

// POST /api/search/visual - Visual similarity search with query image
router.post('/visual', upload.single('file'), (req, res, next) => {
  searchController.visualSearch(req, res, next);
});

module.exports = router;
