const express = require('express');
const router = express.Router();

const authController = require('../auth/authController')

router.post('/register', authController.registrer);
router.post('/login', authController.login);

module.exports = router;