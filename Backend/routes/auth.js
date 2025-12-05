const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/authController');
const { tryCatch } = require('../utils/tryCatch');

router.post('/login', tryCatch(login));
router.post('/logout', tryCatch(logout));
module.exports = router;

