const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/usersController');
const { getBorrowHistory } = require('../controllers/borrowController');
const { tryCatch } = require('../utils/tryCatch');
const { authenticate } = require('../utils/auth');

// user endpoints
router.get('/', authenticate, tryCatch(getUsers));
router.get('/:id', authenticate, tryCatch(getUserById));
router.post('/', authenticate, tryCatch(createUser));
router.put('/:id', authenticate, tryCatch(updateUser));
router.delete('/:id', authenticate, tryCatch(deleteUser));
router.get('/:id/borrow-history', authenticate, tryCatch(getBorrowHistory));

module.exports = router;