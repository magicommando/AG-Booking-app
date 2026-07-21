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

exports.getUserFirearms = async (req, res) => {
  try {
    const { userId } = req.params;
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
    const firearm = await Firearm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: 'Firearm updated', firearm });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteFirearm = async (req, res) => {
  try {
    await Firearm.findByIdAndDelete(req.params.id);
    res.json({ message: 'Firearm deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
