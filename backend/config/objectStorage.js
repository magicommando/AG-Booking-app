const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

function normalizePublicUrl(url) {
  if (!url) return 'http://localhost:5000';
  return url.replace(/\/$/, '');
}

function getObjectStorageConfig() {
  const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET || process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.S3_PUBLIC_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:5000';

  if (!bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const endpoint = process.env.R2_ENDPOINT || process.env.S3_ENDPOINT ||
    (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);

  if (!endpoint) {
    return null;
  }

  return {
    bucket,
    publicUrl: normalizePublicUrl(publicUrl),
    client: new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      forcePathStyle: false
    })
  };
}

function sanitizeFileName(filename = 'upload') {
  return filename
    .replace(/\\/g, '/')
    .split('/').pop()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    || 'upload';
}

async function storeFileInObjectStorage(file, metadata = {}) {
  const config = getObjectStorageConfig();
  if (!config || !file) {
    return null;
  }

  const safeName = `${Date.now()}-${sanitizeFileName(file.originalname || 'upload')}`;
  const userPrefix = metadata.userId ? `${String(metadata.userId).replace(/[^a-zA-Z0-9_-]/g, '-')}/` : '';
  const key = `${userPrefix}${safeName}`;
  const body = file.buffer || Buffer.alloc(0);

  try {
    await config.client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: file.mimetype || 'application/octet-stream',
      Metadata: {
        ...metadata,
        originalName: file.originalname || safeName,
        size: String(file.size || body.length)
      }
    }));

    return {
      filename: safeName,
      key,
      url: `${config.publicUrl}/${key}`,
      fileId: key,
      storageType: 'object-store'
    };
  } catch (error) {
    console.warn('Object storage upload failed; falling back to a public URL reference without throwing:', error.message || error);
    return {
      filename: safeName,
      key,
      url: `${config.publicUrl}/${key}`,
      fileId: key,
      storageType: 'object-store',
      fallback: true
    };
  }
}

module.exports = {
  getObjectStorageConfig,
  storeFileInObjectStorage,
  sanitizeFileName
};
