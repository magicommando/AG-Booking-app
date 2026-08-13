const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');

function getGridFsBucket(bucketName = 'uploads') {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB is not connected');
  }

  return new GridFSBucket(mongoose.connection.db, { bucketName });
}

async function storeFileInGridFs(file, metadata = {}) {
  const bucket = getGridFsBucket();
  const safeName = `${Date.now()}-${file.originalname || 'upload'}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(safeName, {
      contentType: file.mimetype,
      metadata: {
        ...metadata,
        originalName: file.originalname,
        size: file.size
      }
    });

    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve({
        filename: safeName,
        url: `/uploads/grid/${safeName}`,
        fileId: uploadStream.id
      });
    });

    uploadStream.end(file.buffer || Buffer.alloc(0));
  });
}

async function getFileByName(filename, bucketName = 'uploads') {
  const bucket = getGridFsBucket(bucketName);
  const cursor = bucket.find({ filename }).sort({ uploadDate: -1 }).limit(1);
  return cursor.next();
}

module.exports = {
  getGridFsBucket,
  storeFileInGridFs,
  getFileByName
};
