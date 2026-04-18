const AccountModel = require('../models/account.model');


async function createAccount(req, res) {
    const user = req.user;
    
    const account = await AccountModel.create({
        ...req.body,
        user: user._id
    });
    
    res.status(201).json(account);
}


module.exports = {

    createAccount
};
