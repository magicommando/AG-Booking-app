const User = require('../models/User');

// Get a single user profile
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.userId !== id) {
      return res.status(403).json({ message: 'Forbidden: cannot view another user' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const normalizedFullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim() : '';
    const requiredFields = ['email', 'phone', 'location', 'billingAddress', 'preferredContactMethod'];
    const updates = { ...req.body };

    if (req.user.userId !== id) {
      return res.status(403).json({ message: 'Forbidden: cannot update another user' });
    }

    for (const field of requiredFields) {
      if (typeof updates[field] !== 'string' || !updates[field].trim()) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }

    delete updates.password;
    delete updates.fullName;
    delete updates.role;

    if (normalizedFullName) {
      const parts = normalizedFullName.split(/\s+/).filter(Boolean);
      updates.firstName = parts.shift() || updates.firstName;
      updates.lastName = parts.length > 0 ? parts.join(' ') : updates.lastName;
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOwnProfile = async (req, res) => {
  try {
    req.params.id = req.user.userId;
    return exports.updateUser(req, res);
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
