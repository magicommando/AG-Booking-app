// middleware/fileUpload.js

const multer = require('multer');
const path = require('path');

const allowedTypes = [
  '.jpg', '.jpeg', '.png', '.webp',
  '.mp4', '.mov', '.avi', '.m4v', '.webm', '.mkv'
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    return cb(new Error('Invalid file type. Allowed media: JPG, PNG, WEBP, MP4, MOV, AVI, M4V, WEBM, MKV.'));
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
