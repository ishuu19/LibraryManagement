const { connectToDB, ObjectId } = require('../utils/db');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const { generateToken, extractToken, removeToken } = require('../utils/auth');

// login
const login = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    const { email, password } = req.body;

    const errors = {};
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.email = 'Email is required';
    }
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
        errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const user = await db.collection("users").findOne({ email: email.trim() });
        
        if (!user) {
            return sendError(res, 'Invalid credentials', 401);
        }

        await db.collection("users").updateOne(
            { _id: new ObjectId(user._id) },
            { $set: { isActive: true } }
        );

        const token = await generateToken(user);
        const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(user._id) });

        const userData = { ...updatedUser };
        delete userData.password;
        delete userData.tokens;

        return sendSuccess(res, {
            token: token,
            user: userData
        }, 'Login successful', 200);

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

// logout
const logout = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    const token = extractToken(req);
    if (!token) {
        return sendError(res, 'No token provided', 400);
    }
    
    try {
        const user = await db.collection("users").findOne({ tokens: token });
        
        if (!user) {
            return sendError(res, 'Invalid token', 401);
        }

        await removeToken(token);

        const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(user._id) });
        
        if (!updatedUser.tokens || updatedUser.tokens.length === 0) {
            await db.collection("users").updateOne(
                { _id: new ObjectId(user._id) },
                { $set: { isActive: false } }
            );
        }

        return sendSuccess(res, null, 'Logout successful', 200);
    } catch (err) {
        return sendError(res, err.message, 500);
    }
}

module.exports = {
    login,
    logout
};
