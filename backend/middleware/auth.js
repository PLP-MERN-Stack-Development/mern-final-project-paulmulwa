const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Middleware to check user roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Super admin has access to everything
    if (req.user.role === 'super_admin') {
      return next();
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Middleware to check if user is super admin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Only Super Admin can access this route'
    });
  }
  next();
};

// Middleware to check if user can manage admins (super_admin or nlc_admin for county admins only)
exports.canManageAdmins = (req, res, next) => {
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  if (req.user.role === 'nlc_admin') {
    // NLC Admin can only manage county admins
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'You are not authorized to manage administrators'
  });
};

// Middleware to check if county admin is approved
exports.checkApproval = (req, res, next) => {
  // Super admin doesn't need approval
  if (req.user.role === 'super_admin') {
    return next();
  }
  
  if (req.user.role === 'county_admin' && !req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval from NLC Admin'
    });
  }
  next();
};
