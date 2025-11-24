const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { strictRateLimiter } = require('../middleware/rateLimiter');

// Validation rules
const registerValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('nationalId').trim().notEmpty().withMessage('National ID is required'),
  body('kraPin').trim().notEmpty().withMessage('KRA PIN is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('role').optional().isIn(['buyer', 'seller', 'county_admin']).withMessage('Invalid role'),
  body('county').if(body('role').equals('county_admin')).notEmpty().withMessage('County is required for county admin')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', strictRateLimiter, registerValidation, validate, authController.register);
router.post('/login', strictRateLimiter, loginValidation, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
