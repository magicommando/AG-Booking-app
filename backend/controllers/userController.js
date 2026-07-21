const User = require('../models/User');

// Get a single user profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const updates = req.body;

    // Prevent password updates here (use auth controller instead)
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select('-password');

    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all gunsmiths
exports.getGunsmiths = async (req, res) => {
  try {
    const gunsmiths = await User.find({ role: 'gunsmith' }).select('-password');
    res.json(gunsmiths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }).select('-password');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
