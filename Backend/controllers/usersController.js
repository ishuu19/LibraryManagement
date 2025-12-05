const { connectToDB, ObjectId } = require('../utils/db');
const { sendSuccess, sendError, sendValidationError, sendNotFound } = require('../utils/response');
const { emailExists } = require('../utils/users');

// get users
const getUsers = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    if (req.user.role !== 'admin') {
        return sendError(res, 'Forbidden: Admin access required', 403);
    }

    const collection = db.collection('users');

    let {
        keyword = '',
        role,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = {};
    const regexOptions = 'i';

    if (keyword) {
        query.$or = [
            { email: { $regex: keyword, $options: regexOptions } },
            { firstName: { $regex: keyword, $options: regexOptions } },
            { lastName: { $regex: keyword, $options: regexOptions } },
        ];
    }

    if (role) {
        query.role = role;
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const skip = (page - 1) * limit;
    const users = await collection
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .toArray();

    const total = await collection.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const sanitizedUsers = users.map(user => {
        const { password, tokens, ...userWithoutSensitive } = user;
        return userWithoutSensitive;
    });

    return sendSuccess(
        res,
        {
            items: sanitizedUsers,
            pagination: { total, totalPages, currentPage: page, limit }
        },
        'Users fetched successfully'
    );
};

// get user by id
const getUserById = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    if (req.user.role !== 'admin') {
        return sendError(res, 'Forbidden: Admin access required', 403);
    }

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid user ID format' });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(id) });

    if (!user) {
        return sendNotFound(res, 'User');
    }

    const { password, tokens, ...userWithoutSensitive } = user;

    return sendSuccess(res, userWithoutSensitive, 'User fetched successfully');
};

// create user
const createUser = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    if (req.user.role !== 'admin') {
        return sendError(res, 'Forbidden: Admin access required', 403);
    }

    const { email, password, firstName, lastName, role = 'user' } = req.body;

    const errors = {};

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.email = 'Email is required';
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.password = 'Password is required and must be at least 6 characters';
    }

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
        errors.firstName = 'First name is required';
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
        errors.lastName = 'Last name is required';
    }

    if (role && role !== 'user' && role !== 'admin') {
        errors.role = 'Role must be either "user" or "admin"';
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const emailAlreadyExists = await emailExists(email);
        if (emailAlreadyExists) {
            return sendError(res, 'Email already exists', 400);
        }

        const userData = {
            email: email.trim(),
            password: password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            role: role || 'user',
            isActive: true,
            tokens: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('users').insertOne(userData);

        if (!result.insertedId) {
            return sendError(res, 'Failed to create user', 500);
        }

        const newUser = await db.collection('users').findOne({ _id: result.insertedId });

        const { password: pwd, tokens: tkn, ...userWithoutSensitive } = newUser;

        return sendSuccess(res, userWithoutSensitive, 'User created successfully', 201);

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

// update user
const updateUser = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    if (req.user.role !== 'admin') {
        return sendError(res, 'Forbidden: Admin access required', 403);
    }

    const { id } = req.params;
    const { email, firstName, lastName, role } = req.body;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid user ID format' });
    }

    const errors = {};

    if (email !== undefined) {
        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            errors.email = 'Email is required';
        }
    }

    if (firstName !== undefined) {
        if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
            errors.firstName = 'First name is required';
        }
    }

    if (lastName !== undefined) {
        if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
            errors.lastName = 'Last name is required';
        }
    }

    if (role !== undefined) {
        if (role !== 'user' && role !== 'admin') {
            errors.role = 'Role must be either "user" or "admin"';
        }
    }

    if (Object.keys(errors).length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const existingUser = await db.collection('users').findOne({ _id: new ObjectId(id) });
        if (!existingUser) {
            return sendNotFound(res, 'User');
        }

        if (email && email.trim() !== existingUser.email) {
            const emailAlreadyExists = await emailExists(email, id);
            if (emailAlreadyExists) {
                return sendError(res, 'Email already exists', 400);
            }
        }

        const updateData = {
            updatedAt: new Date()
        };

        if (email !== undefined) updateData.email = email.trim();
        if (firstName !== undefined) updateData.firstName = firstName.trim();
        if (lastName !== undefined) updateData.lastName = lastName.trim();
        if (role !== undefined) updateData.role = role;

        const result = await db.collection('users').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!result) {
            return sendError(res, 'Failed to update user', 500);
        }

        const { password, tokens, ...userWithoutSensitive } = result;

        return sendSuccess(res, userWithoutSensitive, 'User updated successfully');

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

// delete user
const deleteUser = async (req, res, next) => {
    const db = await connectToDB();
    req.db = db;

    if (req.user.role !== 'admin') {
        return sendError(res, 'Forbidden: Admin access required', 403);
    }

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
        return sendValidationError(res, { id: 'Invalid user ID format' });
    }

    try {
        const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
        if (!user) {
            return sendNotFound(res, 'User');
        }

        const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });

        if (!result.deletedCount) {
            return sendError(res, 'Failed to delete user', 500);
        }

        return sendSuccess(res, null, 'User deleted successfully');

    } catch (err) {
        return sendError(res, err.message, 500);
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
