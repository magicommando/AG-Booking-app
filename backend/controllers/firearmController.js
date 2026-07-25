const Firearm = require('../models/Firearm');

exports.addFirearm = async (req, res) => {
  try {
    const { userId, manufacturer, model, serial, caliber, photos, notes } = req.body;

    const firearm = await Firearm.create({
      userId,
      manufacturer,
      model,
      serial,
      caliber,
      photos,
      notes
    });

    res.json({ message: 'Firearm added', firearm });
  } catch (err) {
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

    firearm.photoUrl = `/uploads/${req.file.filename}`;
    await firearm.save();

    res.json({ message: 'Photo uploaded', firearm });
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

    // Perform update
    const updated = await Firearm.findByIdAndUpdate(
      req.params.id,
      req.body,
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
