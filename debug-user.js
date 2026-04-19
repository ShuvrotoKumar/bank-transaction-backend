require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');
const AccountModel = require('./src/models/account.model');

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected\n');

        // Show all users with their systemUser status
        console.log('👥 ALL USERS:');
        console.log('=============');
        const users = await userModel.find().select('+systemUser');
        users.forEach(u => {
            console.log(`\nEmail: ${u.email}`);
            console.log(`User ID: ${u._id}`);
            console.log(`systemUser: ${u.systemUser}`);
        });

        // Show all accounts
        console.log('\n\n📋 ALL ACCOUNTS:');
        console.log('================');
        const accounts = await AccountModel.find();
        for (const acc of accounts) {
            const user = await userModel.findById(acc.user);
            console.log(`\nAccount ID: ${acc._id}`);
            console.log(`  User Email: ${user?.email || 'Unknown'}`);
            console.log(`  User ID: ${acc.user}`);
            console.log(`  systemUser flag: ${acc.systemUser}`);
        }

        // Check specific user
        console.log('\n\n🔍 CHECKING santokum369@gmail.com:');
        const user = await userModel.findOne({ email: 'santokum369@gmail.com' }).select('+systemUser');
        if (user) {
            console.log('User found:', user._id);
            console.log('systemUser:', user.systemUser);
            const acc = await AccountModel.findOne({ user: user._id, systemUser: true });
            console.log('Has system account:', acc ? 'YES - ' + acc._id : 'NO');
        }

        await mongoose.disconnect();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

debug();
