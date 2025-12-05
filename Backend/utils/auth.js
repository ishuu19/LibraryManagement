const { connectToDB, ObjectId } = require('./db');
const jwt = require('jsonwebtoken');

if (!process.env.TOKEN_SECRET) {
    process.env.TOKEN_SECRET = 'secret';
}

// generate token
const generateToken = async (user) => {
    const userObj = {...user};
    delete userObj.password;
    delete userObj.tokens;

    const token = jwt.sign(userObj, process.env.TOKEN_SECRET, { expiresIn: 86400});
    const db = await connectToDB();

    try {
        await db.collection('users').updateOne({ _id: new ObjectId(user._id) }, { $addToSet: { tokens: token } });
        return token;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        await db.client.close();
    }
}

// extract token
const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
};

// authenticate
const authenticate = async function (req, res, next) {
    let token = extractToken(req);

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "Unauthorised: No token provided" 
        });
    }

    const db = await connectToDB();
    try {
        const result = await db.collection("users").findOne({ tokens: token });
        if (!result) {
            return res.status(401).json({ 
                success: false,
                message: "Unauthorised: Invalid token" 
            });
        }
        
        await db.collection("users").updateOne(
            { _id: new ObjectId(result._id) },
            { $set: { isActive: true } }
        );
        
        const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(result._id) });
        req.user = updatedUser;
        
        next();
    } catch (err) {
        return res.status(500).json({ 
            success: false,
            message: err.message 
        });
    } finally {
        await db.client.close();
    }
};

// remove token
const removeToken = async function (token) {
    const db = await connectToDB();
    try {
        await db.collection("users").updateOne(
            { tokens: token }, 
            { $pull: { tokens: token } }
        );
    } catch (err) {
        console.error("Error removing token from database:", err);
        throw err;
    } finally {
        await db.client.close();
    }
};

module.exports = { generateToken, authenticate, extractToken, removeToken };