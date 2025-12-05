const {connectToDB, ObjectId} = require('../utils/db');
const {sendSuccess, sendNotFound, sendError, sendValidationError} = require('../utils/response');

// get books
const getBooks = async(req, res, next) =>{
    const db = await connectToDB();
    req.db = db;
    const collection = db.collection('books');
    const borrowingsCollection = db.collection('borrowings');

    const isHomepage = req.query.homepage === 'true';

    if (isHomepage) {
        // Latest 6 books - sorted by createdAt desc
        const latestBooks = await collection
            .find({})
            .sort({ createdAt: -1 })
            .limit(6)
            .toArray();

        // Trending 6 books - recently borrowed books, sorted by most recent borrow date
        const recentBorrowings = await borrowingsCollection
            .aggregate([
                {
                    $sort: { borrowDate: -1 }
                },
                {
                    $group: {
                        _id: '$bookId',
                        mostRecentBorrowDate: { $first: '$borrowDate' }
                    }
                },
                {
                    $sort: { mostRecentBorrowDate: -1 }
                },
                {
                    $limit: 6
                }
            ])
            .toArray();

        const trendingBookIds = recentBorrowings.map(b => new ObjectId(b._id));
        const trendingBooks = trendingBookIds.length > 0 
            ? await collection
                .find({ _id: { $in: trendingBookIds } })
                .toArray()
            : [];
        
        const trendingBooksMap = new Map(trendingBooks.map(book => [book._id.toString(), book]));
        const trendingBooksOrdered = trendingBookIds
            .map(id => trendingBooksMap.get(id.toString()))
            .filter(book => book !== undefined)
            .slice(0, 6);

        // Hot 6 books - most borrowed books, sorted by total borrow count
        const borrowCounts = await borrowingsCollection
            .aggregate([
                {
                    $group: {
                        _id: '$bookId',
                        borrowCount: { $sum: 1 }
                    }
                },
                {
                    $sort: { borrowCount: -1 }
                },
                {
                    $limit: 6
                }
            ])
            .toArray();

        const hotBookIds = borrowCounts.map(b => new ObjectId(b._id));
        const hotBooks = hotBookIds.length > 0
            ? await collection
                .find({ _id: { $in: hotBookIds } })
                .toArray()
            : [];
        
        // Sort hot books to match the order from borrow counts
        const hotBooksMap = new Map(hotBooks.map(book => [book._id.toString(), book]));
        const hotBooksOrdered = hotBookIds
            .map(id => hotBooksMap.get(id.toString()))
            .filter(book => book !== undefined)
            .slice(0, 6);

        return sendSuccess(res, {
            latest: latestBooks || [],
            trending: trendingBooksOrdered || [],
            hot: hotBooksOrdered || []
        }, 'Homepage books fetched successfully');
    }

    let {
        keyword = '',
        category,
        location,
        isHighlighted,
        isBorrowed,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 6,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    // query builder
    const query = {};
    const regexOptions = 'i';

    if(keyword){
        query.$or = [
            {title: {$regex: keyword, $options: regexOptions}},
            {author: {$regex: keyword, $options: regexOptions}},
            {isbn: {$regex: keyword, $options: regexOptions}},
            {description: {$regex: keyword, $options: regexOptions}},
        ]
    }

    if(category) query.category = category;
    if(location) query.location = location;
    if(isHighlighted) query.isHighlighted = Boolean(isHighlighted);
    if(isBorrowed) query.isBorrowed = Boolean(isBorrowed);

    // sorting
    const sort = {[sortBy]: sortOrder === 'asc' ? 1 : -1};

    // pagination
    const skip = (page - 1) * limit;
    let result = await collection.find(query).skip(skip).limit(limit).sort(sort).toArray();
    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    if(!result){
        return sendNotFound(res, 'Books');
    }
    return sendSuccess(res, { items: result, pagination: { total, totalPages, currentPage: page, limit } }, 'Books fetched successfully');
}

// get book by id
const getBookById = async(req, res, next) => {
    const db = await connectToDB();
    req.db = db;
    const collection = db.collection('books');
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return sendValidationError(res, 'Invalid book id');
    const book = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) }, 
        { $inc: { viewCount: 1 } }, 
        { returnDocument: 'after' }
    );
    if (!book) return sendNotFound(res, 'Book');
    return sendSuccess(res, book, 'Book fetched successfully');
};

// create book
const createBook = async (req, res, next) => {
  const db = await connectToDB();
  req.db = db;
  const collection = db.collection('books');


  const errors = {};
  
  if (!req.body.title || typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
    errors.title = 'Title is required';
  }
  
  if (!req.body.author || typeof req.body.author !== 'string' || req.body.author.trim().length === 0) {
    errors.author = 'Author is required';
  }
  
  if (!req.body.isbn || typeof req.body.isbn !== 'string' || req.body.isbn.trim().length === 0) {
    errors.isbn = 'ISBN is required';
  }
  
  if (Object.keys(errors).length > 0) {
    return sendValidationError(res, errors);
  }

  const bookData = {
    title: req.body.title.trim(),
    author: req.body.author.trim(),
    isbn: req.body.isbn.trim(),
    year: req.body.year || null,
    publisher: req.body.publisher || null,
    category: req.body.category || null,
    description: req.body.description || null,
    coverImage: req.body.coverImage || null,
    location: req.body.location || null,
    isHighlighted: Boolean(req.body.isHighlighted) || false,
    isBorrowed: Boolean(req.body.isBorrowed) || false,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(bookData);

  if(!result.insertedId){
    return sendError(res, 'Failed to create book', 500);
  }
  return sendSuccess(res, { bookId: result.insertedId }, 'Book created successfully', 201);
}

// update book
const updateBook = async(req, res, next) =>{
    const db = await connectToDB();
    req.db = db;
    const collection = db.collection('books');

    const {id} = req.params;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid book id' });
    }
    const errors = {};
    
    if (req.body.title !== undefined) {
        if (!req.body.title || typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
            errors.title = 'Title is required';
        }
    }
    
    if (req.body.author !== undefined) {
        if (!req.body.author || typeof req.body.author !== 'string' || req.body.author.trim().length === 0) {
            errors.author = 'Author is required';
        }
    }
    
    if (req.body.isbn !== undefined) {
        if (!req.body.isbn || typeof req.body.isbn !== 'string' || req.body.isbn.trim().length === 0) {
            errors.isbn = 'ISBN is required';
        }
    }
    
    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
    }

    const updateData = {
        updatedAt: new Date()
    };

    if (req.body.title !== undefined) updateData.title = req.body.title.trim();
    if (req.body.author !== undefined) updateData.author = req.body.author.trim();
    if (req.body.isbn !== undefined) updateData.isbn = req.body.isbn.trim();
    if (req.body.year !== undefined) updateData.year = req.body.year || null;
    if (req.body.publisher !== undefined) updateData.publisher = req.body.publisher || null;
    if (req.body.category !== undefined) updateData.category = req.body.category || null;
    if (req.body.description !== undefined) updateData.description = req.body.description || null;
    if (req.body.coverImage !== undefined) updateData.coverImage = req.body.coverImage || null;
    if (req.body.location !== undefined) updateData.location = req.body.location || null;
    if (req.body.isHighlighted !== undefined) updateData.isHighlighted = Boolean(req.body.isHighlighted);
    if (req.body.isBorrowed !== undefined) updateData.isBorrowed = Boolean(req.body.isBorrowed);

    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
    );

    if(!result){
        return sendNotFound(res, 'Book');
    }
    return sendSuccess(res, result, 'Book updated successfully');
}

// delete book
const deleteBook = async(req, res, next) =>{
    const db = await connectToDB();
    req.db = db;
    const collection = db.collection('books');

    const {id} = req.params;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid book id' });
    }

    const result = await collection.deleteOne({_id: new ObjectId(id)});

    if(!result.deletedCount){
        return sendNotFound(res, 'Book');
    }
    return sendSuccess(res, null, 'Book deleted successfully');
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};