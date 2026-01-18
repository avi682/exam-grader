
const express = require('express');
const router = express.Router();
const { registerUser, loginUser, recoverPassword } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/recover', recoverPassword);

module.exports = router;
