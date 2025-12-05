const { connectToDB, ObjectId } = require('./db');

// has active borrow
const hasActiveBorrow = async (userId, bookId) => {
    const db = await connectToDB();
    try {
        const existingBorrow = await db.collection('borrowings').findOne({
            userId: new ObjectId(userId),
            bookId: new ObjectId(bookId),
            status: 'active'
        });
        return existingBorrow !== null;
    } catch (err) {
        console.error('Error checking active borrow:', err);
        throw err;
    } finally {
        await db.client.close();
    }
};

// get active borrow record
const getActiveBorrow = async (userId, bookId) => {
    const db = await connectToDB();
    try {
        const borrowingRecord = await db.collection('borrowings').findOne({
            userId: new ObjectId(userId),
            bookId: new ObjectId(bookId),
            status: 'active'
        });
        return borrowingRecord;
    } catch (err) {
        console.error('Error getting active borrow:', err);
        throw err;
    } finally {
        await db.client.close();
    }
};

// calculate due date
const calculateDueDate = (borrowDate) => {
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);
    return dueDate;
};

module.exports = {
    hasActiveBorrow,
    getActiveBorrow,
    calculateDueDate
};
