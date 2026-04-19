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
        
        const token = req.cookies.token ||req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new Error('Missing token');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.id).select('+systemUser');
        if (!user || !user.systemUser) {
            throw new Error();
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
