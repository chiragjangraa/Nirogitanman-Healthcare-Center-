const jwt = require('jsonwebtoken');
const mockDb = require('../config/mockDb');
const { dbState } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'nirogitanman_jwt_secret_key_2024_secure');

    const role = decoded.role || 'user';
    let entityUser = null;

    if (dbState.isMock) {
      const collection = role === 'admin' ? 'admins' : 'users';
      entityUser = mockDb.findOne(collection, { _id: decoded.id });
    } else {
      // Dynamically require Mongoose models only when MongoDB is connected
      if (role === 'admin') {
        const Admin = require('../models/Admin');
        entityUser = await Admin.findById(decoded.id).select('-password');
      } else {
        const User = require('../models/User');
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
