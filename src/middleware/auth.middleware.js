const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');



async function authMiddleware(req, res, next) {
    try {
        const token = req.cookies.token || req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);
        if (!user) {
            throw new Error();
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
}

module.exports = {
    authMiddleware
};