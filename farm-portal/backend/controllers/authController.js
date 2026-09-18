// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check existing user
    const existingUser = await User.findByUsername(username) || await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Username or email already exists' });

    const userId = await User.create({ username, email, password });
    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username/email and password required' });

    // Try username first, then email
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }

    if (!user) return res.status(400).json({ error: 'Invalid username/email or password' });

    const valid = await User.comparePassword(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid username/email or password' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'my_super_secret_key_123!@#',
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.resetPasswordDirect = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    console.log('Reset password attempt for username:', username);

    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Username and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User found:', user.username);

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(user.id, hashedPassword);

    console.log('Password updated for user:', user.username);

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
};