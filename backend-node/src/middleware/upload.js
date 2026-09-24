const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/products');

// Ensure destination directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `product-${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter for allowed extensions and MIME types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.');
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

// Safe helper to remove an uploaded image file
const deleteImageFile = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;

  try {
    // imageUrl format is expected to be '/uploads/products/filename.ext'
    const fileName = path.basename(imageUrl);
    const resolvedPath = path.resolve(uploadDir, fileName);

    // Guard against directory traversal: ensure resolved path is inside uploadDir
    if (resolvedPath.startsWith(uploadDir) && fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }
  } catch (err) {
    console.warn(`Failed to delete old image (${imageUrl}):`, err.message);
  }
};

module.exports = {
  upload,
  deleteImageFile,
  uploadDir
};
