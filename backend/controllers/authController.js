const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret';
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not configured; using development fallback');
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
      adminInviteCode,
      inviteCode: inviteCodeFromBody,
      gunsmithInviteCode
    } = req.body;
    const normalizedFirstName = firstName || (name ? name.trim().split(/\s+/).shift() : undefined);
    const normalizedLastName = lastName || (name ? name.trim().split(/\s+/).slice(1).join(' ').trim() : undefined);
    const normalizedRole = role === 'gunsmith' || role === 'admin' ? 'gunsmith' : 'client';
    const inviteCode = (
      inviteCodeFromBody ||
      gunsmithInviteCode ||
      adminInviteCode ||
      process.env.GUNSMITH_INVITE_CODE ||
      process.env.ADMIN_INVITE_CODE ||
      process.env.GUNSMITH_ADMIN_INVITE_CODE ||
      process.env.INVITE_CODE
    );

    if (!normalizedFirstName || !normalizedLastName) {
      return res.status(400).json({ message: 'First name and last name are required' });
    }

    if (!phone || !location || !billingAddress || !preferredContactMethod) {
      return res.status(400).json({
        message: 'Phone, location, billing address, and preferred contact method are required'
      });
    }

    if (normalizedRole === 'gunsmith') {
      const normalizedInviteCode = String(inviteCode || '').trim();
      const expectedInviteCode = String(process.env.GUNSMITH_INVITE_CODE || process.env.ADMIN_INVITE_CODE || process.env.GUNSMITH_ADMIN_INVITE_CODE || process.env.INVITE_CODE || '').trim();

      if (!expectedInviteCode) {
        console.warn('No gunsmith invite code configured on the server; allowing registration temporarily');
      } else if (!normalizedInviteCode || normalizedInviteCode !== expectedInviteCode) {
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

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found for that email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30;
    await user.save();

    res.json({
      message: 'Password reset token generated',
      resetToken: token,
      expiresAt: user.resetPasswordExpires
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Reset token and new password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'dev-jwt-secret';
    if (!process.env.JWT_SECRET) {
      console.warn('JWT_SECRET not configured; using development fallback');
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      jwtSecret,
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
        preferredContactMethod: user.preferredContactMethod,
        laborRate: user.laborRate
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
