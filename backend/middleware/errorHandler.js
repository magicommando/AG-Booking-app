module.exports = (err, req, res, next) => {
  console.error('🔥 Error:', err);

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }

  // Validation errors (from validateMiddleware)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors || [err.message]
    });
  }

  // Custom forbidden errors
  if (err.status === 403) {
    return res.status(403).json({
      message: 'Forbidden',
      error: err.message
    });
  }

  // Custom not found errors
  if (err.status === 404) {
    return res.status(404).json({
      message: 'Not found',
      error: err.message
    });
  }

  // Default server error
  res.status(500).json({
    message: 'Server error',
    error: err.message || 'Unexpected error'
  });
};
