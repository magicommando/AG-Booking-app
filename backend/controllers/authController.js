const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured on the server' });
    }
    const {
      firstName,
      lastName,
      email,
      password,
      role = 'client',
      name,
      phone,
      location,
      billingAddress,
      preferredContactMethod,
      adminInviteCode
    } = req.body;
    const normalizedFirstName = firstName || (name ? name.trim().split(/\s+/).shift() : undefined);
    const normalizedLastName = lastName || (name ? name.trim().split(/\s+/).slice(1).join(' ').trim() : undefined);
    const normalizedRole = role === 'gunsmith' ? 'gunsmith' : 'client';
    const inviteCode = process.env.GUNSMITH_INVITE_CODE || process.env.ADMIN_INVITE_CODE;

    if (!normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    if (!phone || !location || !billingAddress || !preferredContactMethod) {
      return res.status(400).json({
        message: 'Phone, location, billing address, and preferred contact method are required'
      });
    }

    if (normalizedRole === 'gunsmith') {
      if (!inviteCode || adminInviteCode !== inviteCode) {
        return res.status(403).json({
          message: 'Gunsmith/admin registration requires a valid invite code'
        });
      }
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email,
      password: hashed,
      role: normalizedRole,
      phone,
      location,
      billingAddress,
      preferredContactMethod
    });

    res.json({ message: 'User registered', userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured on the server' });
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        location: user.location,
        billingAddress: user.billingAddress,
        preferredContactMethod: user.preferredContactMethod
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
