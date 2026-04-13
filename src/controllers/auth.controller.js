const userModel = require('../models/user.model');

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await userModel.create({ name, email, password });
    res.send(user);
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