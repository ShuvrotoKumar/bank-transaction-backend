require('dotenv').config();
const mongoose = require('mongoose');
const AccountModel = require('./src/models/account.model');
const userModel = require('./src/models/user.model');

async function manageAccounts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected\n');

        // Show all accounts
        console.log('📋 ALL ACCOUNTS IN DATABASE:');
        console.log('============================');
        const accounts = await AccountModel.find().populate('user', 'email name');
        
        if (accounts.length === 0) {
            console.log('❌ No accounts found!\n');
        } else {
            accounts.forEach((acc, i) => {
                console.log(`\n${i + 1}. Account ID: ${acc._id}`);
                console.log(`   User: ${acc.user?.email || 'Unknown'}`);
                console.log(`   Currency: ${acc.currency}`);
                console.log(`   Status: ${acc.status}`);
                console.log(`   System Account: ${acc.systemUser || false}`);
            });
        }

        // Show all users
        console.log('\n\n👥 ALL USERS IN DATABASE:');
        console.log('==========================');
        const users = await userModel.find({}, { email: 1, systemUser: 1 });
        users.forEach((user, i) => {
            console.log(`\n${i + 1}. User ID: ${user._id}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   System User: ${user.systemUser}`);
        });

        // If no accounts, offer to create
        if (accounts.length === 0 && users.length > 0) {
            console.log('\n\n⚠️  No accounts found!');
            console.log('Creating account for first user...\n');
            
            const newAccount = await AccountModel.create({
                user: users[0]._id,
                currency: 'USD',
                status: 'active'
            });
            
            console.log('✅ Account created!');
            console.log(`Account ID: ${newAccount._id}`);
            console.log(`Use this ID as "toAccount" in your API call`);
        }

        await mongoose.disconnect();
        console.log('\n\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

manageAccounts();
