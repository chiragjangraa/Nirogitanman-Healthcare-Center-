const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nirogitanman_secret_key_123_abc_xyz');
    
    let entityUser = null;
    const role = decoded.role || 'user';

    if (dbState.isMock) {
      const collection = role === 'admin' ? 'admins' : 'users';
      entityUser = mockDb.findOne(collection, { _id: decoded.id });
    } else {
      if (role === 'admin') {
        entityUser = await Admin.findById(decoded.id).select('-password');
      } else {
        entityUser = await User.findById(decoded.id).select('-password');
      }
    }

    if (!entityUser) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = {
      id: entityUser._id,
      email: entityUser.email,
      role: entityUser.role || role,
      name: entityUser.name,
      phone: entityUser.phone || ''
    };
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
