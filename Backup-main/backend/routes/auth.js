const express = require('express');
const router = express.Router();
const authController = require('../controller/auth');

// Signup, Signin, Register Tutor
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/registerTutor', authController.uploadMiddleware, authController.registerTutor);

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
