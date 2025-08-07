const express = require('express');
const { validateLogin } = require('../middleware/validation');
const { validateLoginCode, generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Login for officials and admin with unique codes
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { role, code } = req.body;

    // Validate the login code
    if (!validateLoginCode(role, code)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid login credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(role);

    res.json({
      success: true,
      message: `${role} logged in successfully`,
      data: {
        token,
        role,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (client-side token removal)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/auth/verify
 * Verify token validity
 */
router.get('/verify', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        role: decoded.role,
        loginTime: decoded.loginTime
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;