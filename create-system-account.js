require('dotenv').config();
const mongoose = require('mongoose');
const AccountModel = require('./src/models/account.model');
const userModel = require('./src/models/user.model');

async function createSystemAccount() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        const userEmail = process.argv[2] || 'santokumar369@gmail.com';
        
        // Find the system user
        const user = await userModel.findOne({ email: userEmail });
        if (!user) {
            console.log('❌ User not found:', userEmail);
            process.exit(1);
        }

        console.log('Found user:', user.email, 'ID:', user._id);

        // Check if system account already exists
        const existingAccount = await AccountModel.findOne({ 
            user: user._id,
            systemUser: true 
        });

        if (existingAccount) {
            console.log('✅ System account already exists:', existingAccount._id);
            console.log('Balance:', await existingAccount.getBalance());
            process.exit(0);
        }

        // Create system account with large balance
        const account = await AccountModel.create({
            user: user._id,
            systemUser: true,
            currency: 'USD',
            status: 'active'
        });

        console.log('✅ System account created successfully!');
        console.log('Account ID:', account._id);
        console.log('User:', user.email);
        console.log('Initial Balance: 0 (use ledger entries to add funds)');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createSystemAccount();
