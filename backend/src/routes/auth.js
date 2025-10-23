const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

// Get captcha
router.get('/captcha', authController.getCaptcha.bind(authController));

// Login
router.post(
  '/login',
  validation.validateLogin(),
  authController.login.bind(authController)
);
router.post(
  '/register',
  validation.validateRegister(),
  authController.register.bind(authController)
);

// Get current user
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser.bind(authController)
);

// Logout
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

module.exports = router;