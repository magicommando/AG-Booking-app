const fs = require('fs');
const path = require('path');
const { GridFSBucket } = require('mongodb');
const mongoose = require('mongoose');
const { storeFileInObjectStorage } = require('./objectStorage');

function getLocalUploadsDir() {
  return path.resolve(__dirname, '..', '..', 'uploads');
}

function fallbackLocalStore(file, metadata = {}) {
  const uploadsDir = getLocalUploadsDir();
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeName = `${Date.now()}-${file.originalname || 'upload'}`;
  const targetPath = path.join(uploadsDir, safeName);
  const buffer = file.buffer || Buffer.alloc(0);
  fs.writeFileSync(targetPath, buffer);

  return {
    filename: safeName,
    url: `/uploads/${safeName}`,
    fileId: null,
    fallback: true,
    metadata
  };
}

function getGridFsBucket(bucketName = 'uploads') {
  if (!mongoose.connection || !mongoose.connection.db) {
    throw new Error('MongoDB is not connected');
  }

  return new GridFSBucket(mongoose.connection.db, { bucketName });
}

async function storeFileInGridFs(file, metadata = {}) {
  const objectStoreResult = await storeFileInObjectStorage(file, metadata);
  if (objectStoreResult) {
    return {
      ...objectStoreResult,
      url: objectStoreResult.url,
      storageType: 'object-store'
    };
  }

  if (!mongoose.connection || !mongoose.connection.db) {
    return fallbackLocalStore(file, metadata);
  }

  try {
    const bucket = getGridFsBucket();
    const safeName = `${Date.now()}-${file.originalname || 'upload'}`;

    return await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(safeName, {
        contentType: file.mimetype,
        metadata: {
          ...metadata,
          originalName: file.originalname,
          size: file.size
        }
      });

      uploadStream.on('error', (error) => {
        if (error && /not connected|MongoDB is not connected/i.test(error.message || '')) {
          resolve(fallbackLocalStore(file, metadata));
          return;
        }
        reject(error);
      });

      uploadStream.on('finish', () => {
        resolve({
          filename: safeName,
          url: `/uploads/grid/${safeName}`,
          fileId: uploadStream.id
        });
      });

      uploadStream.end(file.buffer || Buffer.alloc(0));
    });
  } catch (error) {
    return fallbackLocalStore(file, metadata);
  }
}

async function getFileByName(filename, bucketName = 'uploads') {
  if (!mongoose.connection || !mongoose.connection.db) {
    return null;
  }

  const bucket = getGridFsBucket(bucketName);
  const cursor = bucket.find({ filename }).sort({ uploadDate: -1 }).limit(1);
  return cursor.next();
}

async function deleteFileByName(filename, bucketName = 'uploads') {
  if (!mongoose.connection || !mongoose.connection.db) {
    const localPath = path.join(getLocalUploadsDir(), filename);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  }

  try {
    const bucket = getGridFsBucket(bucketName);
    const file = await getFileByName(filename, bucketName);

    if (!file) {
      return false;
    }

    await new Promise((resolve, reject) => {
      bucket.delete(file._id, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    return true;
  } catch (error) {
    const localPath = path.join(getLocalUploadsDir(), filename);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      return true;
    }
    return false;
  }
}

module.exports = {
  getGridFsBucket,
  storeFileInGridFs,
  getFileByName,
  deleteFileByName
};
