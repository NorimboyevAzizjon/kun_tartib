const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validatsiya
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Ism kiritish shart'),
  body('email').isEmail().withMessage('Email noto\'g\'ri'),
  body('password').isLength({ min: 6 }).withMessage('Parol kamida 6 ta belgi bo\'lsin')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email noto\'g\'ri'),
  body('password').notEmpty().withMessage('Parol kiritish shart')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
