const { connectToDB, ObjectId } = require('../utils/db');
const { sendSuccess, sendError, sendValidationError, sendNotFound } = require('../utils/response');
const { hasActiveBorrow, getActiveBorrow, calculateDueDate } = require('../utils/borrow');

// borrow book
const borrowBook = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    const { id } = req.params;
    const { returnDate } = req.body;
    const userId = req.user._id;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid book ID format' });
    }

    try {
        const book = await db.collection('books').findOne({ _id: new ObjectId(id) });
        if (!book) {
            return sendNotFound(res, 'Book');
        }

        const hasBorrow = await hasActiveBorrow(userId, id);
        if (hasBorrow) {
            return sendError(res, 'You already have an active borrow for this book', 400);
        }

        const borrowDate = new Date();
        const dueDate = calculateDueDate(borrowDate);

        const borrowingData = {
            userId: new ObjectId(userId),
            bookId: new ObjectId(id),
            borrowDate: borrowDate,
            dueDate: dueDate,
            returnDate: returnDate ? new Date(returnDate) : null,
            comments: req.body.comments || null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('borrowings').insertOne(borrowingData);

        if (!result.insertedId) {
            return sendError(res, 'Failed to create borrowing record', 500);
        }

        const borrowingRecord = await db.collection('borrowings').findOne({ _id: result.insertedId });

        return sendSuccess(res, borrowingRecord, 'Book borrowed successfully', 201);

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

// return book
const returnBook = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    const { id } = req.params;
    const { comments } = req.body;
    const userId = req.user._id;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid book ID format' });
    }

    try {
        const borrowingRecord = await getActiveBorrow(userId, id);

        if (!borrowingRecord) {
            return sendError(res, 'No active borrow found for this book', 400);
        }

        const returnDate = new Date();
        const updateData = {
            returnDate: returnDate,
            status: 'returned',
            updatedAt: new Date()
        };

        if (comments !== undefined) {
            updateData.comments = comments;
        }

        const result = await db.collection('borrowings').findOneAndUpdate(
            { _id: borrowingRecord._id },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return sendError(res, 'Failed to update borrowing record', 500);
        }

        return sendSuccess(res, result, 'Book returned successfully', 200);

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

// get borrow history for a book
const getBorrowHistory = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (req.user.role !== 'admin') {
        return sendError(res, 'Forbidden: Admin access required', 403);
    }

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid ID format' });
    }

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const book = await db.collection('books').findOne({ _id: new ObjectId(id) });
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

        let query;
        let entity;
        let entityType;

        if (book) {
            query = { bookId: new ObjectId(id) };
            entity = book;
            entityType = 'book';
        } else if (user) {
            query = { userId: new ObjectId(id) };
            entity = user;
            entityType = 'user';
        } else {
            return sendNotFound(res, 'Book or User');
        }

        const borrowings = await db.collection('borrowings')
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        const total = await db.collection('borrowings').countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        const addedBorrowings = await Promise.all(
            borrowings.map(async (borrowing) => {
                const borrowingUser = await db.collection('users').findOne(
                    { _id: new ObjectId(borrowing.userId) },
                    { projection: { email: 1, firstName: 1, lastName: 1 } }
                );

                const borrowingBook = await db.collection('books').findOne(
                    { _id: new ObjectId(borrowing.bookId) },
                    { projection: { title: 1 } }
                );

                return {
                    _id: borrowing._id,
                    userId: borrowing.userId,
                    bookId: borrowing.bookId,
                    borrowDate: borrowing.borrowDate,
                    returnDate: borrowing.returnDate,
                    dueDate: borrowing.dueDate,
                    comments: borrowing.comments,
                    status: borrowing.status,
                    createdAt: borrowing.createdAt,
                    updatedAt: borrowing.updatedAt,
                    user: borrowingUser ? {
                        email: borrowingUser.email,
                        firstName: borrowingUser.firstName,
                        lastName: borrowingUser.lastName
                    } : null,
                    book: borrowingBook ? {
                        _id: borrowingBook._id,
                        title: borrowingBook.title,
                    } : null
                };
            })
        );

        return sendSuccess(res, {
            items: addedBorrowings,
            pagination: {
                total,
                totalPages,
                currentPage: pageNum,
                limit: limitNum
            }
        }, 'Borrow history fetched successfully', 200);

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

module.exports = {
    borrowBook,
    returnBook,
    getBorrowHistory
};
