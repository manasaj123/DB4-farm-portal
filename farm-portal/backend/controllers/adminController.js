const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Username, email and password are required' });
    const existing = await User.findByUsername(username) || await User.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'User already exists' });
    const userId = await User.create({ username, email, password, role });
    res.status(201).json({ message: 'User created', userId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role } = req.body;
    const updated = await User.update(id, { username, email, role });
    if (updated) return res.json({ message: 'User updated' });
    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.delete(id);
    if (deleted) return res.json({ message: 'User deleted' });
    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};