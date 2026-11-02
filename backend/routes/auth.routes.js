const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation, validate } = require('../middleware/validator');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.get('/bookmarks', authController.requireUser, authController.bookmarks);
router.post('/bookmarks', authController.requireUser, authController.toggleBookmark);

module.exports = router;
