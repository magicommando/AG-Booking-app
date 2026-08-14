const Firearm = require('../models/Firearm');
const { storeFileInGridFs } = require('../config/gridfs');

function normalizeFirearmPayload(body = {}) {
  const {
    manufacturer,
    make,
    model,
    serial,
    serialNumber,
    caliber,
    type,
    photos,
    images,
    photoUrl,
    image,
    notes
  } = body;

  const sourcePhotos = Array.isArray(photos)
    ? photos
    : Array.isArray(images)
      ? images
      : [];

  const normalizedPhotos = [...sourcePhotos, photoUrl, image]
    .filter((url) => typeof url === 'string' && url.trim())
    .map((url) => url.trim())
    .filter((url, index, arr) => arr.indexOf(url) === index);

  return {
    manufacturer: manufacturer || make,
    model,
    serial: serial || serialNumber,
    caliber,
    type,
    photos: normalizedPhotos,
    notes
  };
}

exports.listFirearms = async (req, res) => {
  try {
    const query = req.user?.role === 'client'
      ? { userId: req.user.userId }
      : {};

    const firearms = await Firearm.find(query)
      .populate('userId', 'firstName lastName fullName name email')
      .sort({ createdAt: -1 });
    res.json(firearms);
  } catch (err) {
    console.error('List firearms error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.addFirearm = async (req, res) => {
  try {
    const { userId } = req.body;
    const normalized = normalizeFirearmPayload(req.body);
    const ownerId = userId || req.user?.userId;

    if (!ownerId) {
      return res.status(400).json({ message: 'Authenticated user is required to create a firearm' });
    }

    const firearm = await Firearm.create({
      userId: ownerId,
      ...normalized
    });

    res.json({ message: 'Firearm added', firearm });
  } catch (err) {
    console.error('Add firearm error:', err);
    res.status(500).json({ error: err.message });
  }
};
// upload photo for a firearm (client only, own firearms)
exports.uploadPhoto = async (req, res) => {
  try {
    const firearm = await Firearm.findById(req.params.id);
    if (!firearm) return res.status(404).json({ message: 'Firearm not found' });

    if (firearm.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your firearm' });
    }

    const storageResult = await storeFileInGridFs(req.file, {
      userId: req.user?.userId,
      mediaType: 'image'
    });
    const uploadedUrl = storageResult.url;

    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5000';
    const publicUrl = /^https?:\/\//i.test(uploadedUrl)
      ? uploadedUrl
      : `${baseUrl.replace(/\/$/, '')}${uploadedUrl.startsWith('/') ? uploadedUrl : `/${uploadedUrl}`}`;

    firearm.photos = Array.isArray(firearm.photos) ? firearm.photos : [];
    if (!firearm.photos.includes(publicUrl)) {
      firearm.photos.push(publicUrl);
    }
    await firearm.save();

    res.json({ message: 'Photo uploaded', photoUrl: publicUrl, mediaUrl: publicUrl, firearm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get firearms for a user (client or gunsmith)
exports.getUserFirearms = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role === 'client' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: cannot view another client’s firearms' });
    }

    const firearms = await Firearm.find({ userId });
    res.json(firearms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFirearm = async (req, res) => {
  try {
    const firearm = await Firearm.findById(req.params.id);
    if (!firearm) return res.status(404).json({ message: 'Firearm not found' });

    if (req.user.role === 'client' && String(firearm.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Forbidden: not your firearm' });
    }

    res.json(firearm);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFirearm = async (req, res) => {
  try {
    const firearm = await Firearm.findById(req.params.id);

    if (!firearm) {
      return res.status(404).json({ message: 'Firearm not found' });
    }

    // Ownership check
    if (firearm.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your firearm' });
    }

    // Normalize payload so frontend fields update model fields consistently.
    const updates = normalizeFirearmPayload(req.body);
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    // Perform update
    const updated = await Firearm.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ message: 'Firearm updated', firearm: updated });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFirearm = async (req, res) => {
  try {
    const firearm = await Firearm.findById(req.params.id);

    if (!firearm) {
      return res.status(404).json({ message: 'Firearm not found' });
    }

    // Ownership check
    if (firearm.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden: not your firearm' });
    }

    await Firearm.findByIdAndDelete(req.params.id);
    res.json({ message: 'Firearm deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
