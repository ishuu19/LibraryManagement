const express = require('express');
const router = express.Router();
const {getBooks, getBookById, createBook, updateBook, deleteBook} = require('../controllers/booksController');
const { borrowBook, returnBook, getBorrowHistory } = require('../controllers/borrowController');
const { tryCatch } = require('../utils/tryCatch');
const { authenticate } = require('../utils/auth');

// book endpoints
router.get('/', tryCatch(getBooks));
router.get('/:id', tryCatch(getBookById));
router.post('/', authenticate, tryCatch(createBook));
router.put('/:id', authenticate, tryCatch(updateBook));
router.delete('/:id', authenticate, tryCatch(deleteBook));

// Borrow endpoints
router.post('/:id/borrow', authenticate, tryCatch(borrowBook));
router.post('/:id/return', authenticate, tryCatch(returnBook));
router.get('/:id/borrow-history', authenticate, tryCatch(getBorrowHistory));

module.exports = router;