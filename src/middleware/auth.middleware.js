const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');



async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.header('Authorization');
        const token = req.cookies.token || (authHeader && authHeader.replace('Bearer ', ''));

        if (!token) {
            throw new Error('Missing token');
        }

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


async function authSystemUserMiddleware(req, res, next) {
    try {
        console.log('=== DEBUG: authSystemUserMiddleware ===');
        console.log('Cookies:', req.cookies);
        console.log('Authorization header:', req.headers.authorization);
        
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
        console.log('Token found:', token ? 'YES' : 'NO');

        if (!token) {
            throw new Error('Missing token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        
        const user = await userModel.findById(decoded.id).select('+systemUser');
        console.log('User found:', user ? 'YES' : 'NO');
        console.log('User systemUser field:', user?.systemUser);
        
        if (!user || !user.systemUser) {
            throw new Error(`User not found or not system user. systemUser=${user?.systemUser}`);
        }
        
        req.user = user;
        console.log('=== SUCCESS: System user authenticated ===');
        next();
    } catch (error) {
        console.log('=== ERROR:', error.message, '===');
        res.status(401).send({ error: 'Please authenticate.', detail: error.message });
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};
