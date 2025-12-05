var express = require('express');
var router = express.Router();

const {
  ObjectId,
  connectToDB,
} = require('../utils/db');
const { tryCatch } = require('../utils/tryCatch');
const { sendSuccess, sendError } = require('../utils/response');



// Home page
router.get('/', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;
  const highlightedBooks = await db.collection('books').find({ isHighlighted: true }).toArray();
  const highlighted15 = highlightedBooks.slice(0, 15);
  
  const borrowedBooks = await db.collection('books').find({ isBorrowed: true }).toArray();
  
  const shuffled = borrowedBooks.sort(() => 0.5 - Math.random());
  const hot6 = shuffled.slice(0, 6);
  
  const newBooks = await db.collection('books').find({ createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }).toArray();
  const newBooks6 = newBooks.slice(0, 6);
  
  const shuffledNew = newBooks.sort(() => 0.5 - Math.random());
  const trending6 = shuffledNew.slice(0, 6);
  
  // Render the home page template
  res.render('index', { 
    title: 'Online Library',
    highlightedBooks: highlighted15 || [], 
    hot6: hot6 || [], 
    trending6: trending6 || [], 
    newBooks: newBooks6 || []
  });
}));





// All books page with pagination
router.get('/books', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;

  const skip = (page - 1) * limit;

  const books = await db.collection('books').find().skip(skip).limit(limit).toArray();
  const total = await db.collection('books').countDocuments({});

  const result = {
    books,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
  
  if (result.books && result.books.length > 0) {
    res.render('books', { 
      title: 'All Books',
      books: result.books,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  }
  else {
    sendError(res, 'No books found', 404);
  }
}));



// Get a single book by id
router.get('/book/detail/:id', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;

  if (!ObjectId.isValid(req.params.id)) {
    return sendError(res, 'Invalid book ID format', 400);
  }

  const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
  if (book) {
    res.render('book-detail', { 
      title: book.title,
      book: book 
    });
  }
  else {
    sendError(res, 'Book not found', 404);
  }
}));




// Delete a book
router.post('/book/delete/:id', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;
  
  if (!ObjectId.isValid(req.params.id)) {
    return sendError(res, 'Invalid book ID format', 400);
  }
  
  const result = await db.collection('books').deleteOne({ _id: new ObjectId(req.params.id) });
  if (result.deletedCount > 0) {
    sendSuccess(res, 'Book deleted successfully');
    
  }
  else {
    sendError(res, 'Book not found', 404);
  }
}));



// Show add book form
router.get('/book/add', tryCatch(async (req, res) => {
  res.render('book-add', { 
    title: 'Add New Book',
    book: null 
  });
}));

// Add a book
router.post('/book/add', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;
  
  const {
    title,
    description,
    coverImage,
    author,
    isbn,
    publisher,
    year,
    category,
    location,
    isHighlighted,
    isBorrowed
  } = req.body;

  if (!title || !author || !isbn) {
    return sendError(res, 'Title, author, and ISBN are required fields', 400);
  }

  const parsedYear = parseInt(year);
  if (year && (isNaN(parsedYear) || parsedYear < 1000 || parsedYear > new Date().getFullYear() + 1)) {
    return sendError(res, 'Invalid year format', 400);
  }

  const parsedIsHighlighted = isHighlighted === 'true' || isHighlighted === true;
  const parsedIsBorrowed = isBorrowed === 'true' || isBorrowed === true;

  const bookData = {
    title: title.trim(),
    description: description ? description.trim() : '',
    coverImage: coverImage ? coverImage.trim() : '',
    author: author.trim(),
    isbn: isbn.trim(),
    publisher: publisher ? publisher.trim() : '',
    year: parsedYear || null,
    category: category ? category.trim() : '',
    location: location ? location.trim() : '',
    isHighlighted: parsedIsHighlighted,
    isBorrowed: parsedIsBorrowed,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await db.collection('books').insertOne(bookData);
  if (result.insertedId) {
    sendSuccess(res, 'Book added successfully', { bookId: result.insertedId });
  }
  else {
    sendError(res, 'Failed to add book', 500);
  }
}));



// Get book for editing
router.get('/book/edit/:id', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;
  
  if (!ObjectId.isValid(req.params.id)) {
    return sendError(res, 'Invalid book ID format', 400);
  }
  
  const book = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
  if (book) {
    res.render('book-edit', { 
      title: `Edit ${book.title}`,
      book: book 
    });
  }
  else {
    sendError(res, 'Book not found', 404);
  }
}));


// Update a book
router.post('/book/edit/:id', tryCatch(async (req, res) => {
  const db = await connectToDB();
  req.db = db;
  
  if (!ObjectId.isValid(req.params.id)) {
    return sendError(res, 'Invalid book ID format', 400);
  }
  
  const {
    title,
    description,
    coverImage,
    author,
    isbn,
    publisher,
    year,
    category,
    location,
    isHighlighted,
    isBorrowed
  } = req.body;

  if (!title || !author || !isbn) {
    return sendError(res, 'Title, author, and ISBN are required fields', 400);
  }

  const parsedYear = parseInt(year);
  if (year && (isNaN(parsedYear) || parsedYear < 1000 || parsedYear > new Date().getFullYear() + 1)) {
    return sendError(res, 'Invalid year format', 400);
  }

  const parsedIsHighlighted = isHighlighted === 'true' || isHighlighted === true;
  const parsedIsBorrowed = isBorrowed === 'true' || isBorrowed === true;

  const updateData = {
    title: title.trim(),
    description: description ? description.trim() : '',
    coverImage: coverImage ? coverImage.trim() : '',
    author: author.trim(),
    isbn: isbn.trim(),
    publisher: publisher ? publisher.trim() : '',
    year: parsedYear || null,
    category: category ? category.trim() : '',
    location: location ? location.trim() : '',
    isHighlighted: parsedIsHighlighted,
    isBorrowed: parsedIsBorrowed,
    updatedAt: new Date()
  };

  const originalBook = await db.collection('books').findOne({ _id: new ObjectId(req.params.id) });
  if (!originalBook) {
    return sendError(res, 'Book not found', 404);
  }

  updateData.createdAt = originalBook.createdAt;

  const result = await db.collection('books').updateOne(
    { _id: new ObjectId(req.params.id) }, 
    { $set: updateData }
  );
  
  if (result.modifiedCount > 0) {
    sendSuccess(res, 'Book updated successfully', { bookId: req.params.id });
  }
  else {
    sendError(res, 'Book not found or no changes made', 404);
  }
}));



module.exports = router;