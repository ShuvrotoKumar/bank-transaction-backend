const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken'); 

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const isExists = await userModel.findOne({ email });
    if (isExists) {
        return res.status(400).send('User already exists');
    }
    const user = await userModel.create({ name, email, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({
        message: 'User created successfully',
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token: token
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
        return res.status(400).send('User not found');
    }
    const isPasswordValid = user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(400).send('Invalid password');
    }
    res.send(user);
};

module.exports = {
    register,
    login
};