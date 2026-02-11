const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);

module.exports = router;