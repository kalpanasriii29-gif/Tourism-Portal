const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware to verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

/**
 * Middleware to check if user is official or admin
 */
const requireOfficialOrAdmin = (req, res, next) => {
  if (!req.user || !['official', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Official or admin role required.' 
    });
  }
  next();
};

/**
 * Middleware to check if user is admin only
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin role required.' 
    });
  }
  next();
};

/**
 * Generate JWT token for authenticated users
 */
const generateToken = (role) => {
  return jwt.sign(
    { role, loginTime: new Date() },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Validate login codes
 */
const validateLoginCode = (role, code) => {
  const validCodes = {
    official: process.env.OFFICIAL_LOGIN_CODE,
    admin: process.env.ADMIN_LOGIN_CODE
  };

  return validCodes[role] === code;
};

module.exports = {
  verifyToken,
  requireOfficialOrAdmin,
  requireAdmin,
  generateToken,
  validateLoginCode
};