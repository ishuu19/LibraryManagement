const { connectToDB, ObjectId } = require('./db');

// email exists
const emailExists = async (email, excludeUserId = null) => {
    const db = await connectToDB();
    try {
        const query = { email: email.trim() };
        if (excludeUserId) {
            query._id = { $ne: new ObjectId(excludeUserId) };
        }
        const user = await db.collection('users').findOne(query);
        return user !== null;
    } catch (err) {
        console.error('Error checking email existence:', err);
        throw err;
    } finally {
        await db.client.close();
    }
};

// is admin
const isAdmin = (user) => {
    return user && user.role === 'admin';
};

module.exports = {
    emailExists,
    isAdmin
};
