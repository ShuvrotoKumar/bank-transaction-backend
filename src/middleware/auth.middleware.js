const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate any user via JWT token
 * Supports both cookie and Authorization header
 */
async function authMiddleware(req, res, next) {
    try {
        // Extract token from cookie or Authorization header
        const authHeader = req.header('Authorization');
        const token = req.cookies.token || (authHeader && authHeader.replace('Bearer ', ''));

        if (!token) {
            throw new Error('Missing token');
        }

        // Verify token and attach user to request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}


/**
 * Middleware to authenticate system users only
 * Validates JWT token and checks systemUser flag
 */
async function authSystemUserMiddleware(req, res, next) {
    try {
        // Extract token from cookie or Authorization header
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Missing token');
        }

        // Verify JWT and extract user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user with systemUser field (excluded by default)
        const user = await userModel.findById(decoded.id).select('+systemUser');
        
        // Validate user exists and has system user privileges
        if (!user || !user.systemUser) {
            throw new Error('User not found or not system user');
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};
