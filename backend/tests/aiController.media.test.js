const aiController = require('../controllers/aiController');
const firearmController = require('../controllers/firearmController');
const MediaAsset = require('../models/MediaAsset');
const gridfs = require('../config/gridfs');
const { storeFileInGridFs, deleteFileByName } = require('../config/gridfs');
const Firearm = require('../models/Firearm');
const mongoose = require('mongoose');

jest.mock('../models/MediaAsset', () => ({
  create: jest.fn(),
  deleteMany: jest.fn()
}));

jest.mock('../config/gridfs', () => {
  const actual = jest.requireActual('../config/gridfs');
  return {
    ...actual,
    storeFileInGridFs: jest.fn(actual.storeFileInGridFs),
    deleteFileByName: jest.fn(actual.deleteFileByName)
  };
});

jest.mock('../models/Firearm', () => ({
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}));

describe('aiController.uploadMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const actualGridFs = jest.requireActual('../config/gridfs');
    storeFileInGridFs.mockImplementation(actualGridFs.storeFileInGridFs);
    deleteFileByName.mockImplementation(actualGridFs.deleteFileByName);
  });

  it('stores uploaded media metadata in MongoDB so it persists beyond page reloads', async () => {
    const req = {
      user: { userId: '507f1f77bcf86cd799439011' },
      file: {
        filename: 'abc123.png',
        originalname: 'issue.png',
        mimetype: 'image/png',
        size: 2048
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    storeFileInGridFs.mockResolvedValue({
      filename: 'abc123.png',
      url: '/uploads/grid/abc123.png',
      fileId: 'gridfs-1'
    });

    MediaAsset.create.mockResolvedValue({
      _id: 'asset-1',
      url: '/uploads/grid/abc123.png',
      type: 'image'
    });

    await aiController.uploadMedia(req, res);

    expect(storeFileInGridFs).toHaveBeenCalled();
    expect(MediaAsset.create).toHaveBeenCalledWith(expect.objectContaining({
      url: '/uploads/grid/abc123.png',
      type: 'image',
      fileName: 'abc123.png'
    }));

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      mediaUrl: '/uploads/grid/abc123.png',
      photoUrl: '/uploads/grid/abc123.png'
    }));
  });

  it('keeps firearm photo uploads on the GridFS-backed media path', async () => {
    const req = {
      params: { id: 'firearm-1' },
      user: { userId: '507f1f77bcf86cd799439011' },
      file: {
        filename: 'firearm.png',
        originalname: 'firearm.png',
        mimetype: 'image/png',
        size: 4096,
        buffer: Buffer.from('image')
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    Firearm.findById.mockResolvedValue({
      userId: { toString: () => '507f1f77bcf86cd799439011' },
      photos: [],
      save: jest.fn().mockResolvedValue(true)
    });

    storeFileInGridFs.mockResolvedValue({
      filename: 'firearm.png',
      url: '/uploads/grid/firearm.png',
      fileId: 'gridfs-firearm'
    });

    await firearmController.uploadPhoto(req, res);

    expect(storeFileInGridFs).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      photoUrl: '/uploads/grid/firearm.png'
    }));
  });

  it('deletes uploaded media files from GridFS when a user removes an upload', async () => {
    const req = {
      user: { userId: '507f1f77bcf86cd799439011' },
      body: { url: '/uploads/grid/firearm.png' }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    deleteFileByName.mockResolvedValue(true);
    MediaAsset.deleteMany.mockResolvedValue({ deletedCount: 1 });

    await aiController.deleteMedia(req, res);

    expect(deleteFileByName).toHaveBeenCalledWith('firearm.png');
    expect(MediaAsset.deleteMany).toHaveBeenCalledWith(expect.objectContaining({
      fileName: 'firearm.png'
    }));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      deleted: true,
      fileName: 'firearm.png'
    }));
  });

  it('falls back to a local upload path when Mongo GridFS is unavailable', async () => {
    const originalDb = mongoose.connection.db;
    mongoose.connection.db = null;

    try {
      const result = await gridfs.storeFileInGridFs({
        originalname: 'fallback.png',
        mimetype: 'image/png',
        size: 12,
        buffer: Buffer.from('test')
      }, { userId: '507f1f77bcf86cd799439011' });

      expect(result.url).toContain('/uploads/');
      expect(result.url).not.toContain('/uploads/grid/');
    } finally {
      mongoose.connection.db = originalDb;
    }
  });
});
