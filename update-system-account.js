require('dotenv').config();
const mongoose = require('mongoose');

async function updateSystemAccount() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected\n');

        // Update santokumar369's account to be system account
        const result = await mongoose.connection.collection('accounts').updateOne(
            { _id: new mongoose.Types.ObjectId('69e418ce28356c16bf089161') },
            { $set: { systemUser: true } }
        );

        if (result.matchedCount === 0) {
            console.log('❌ Account not found');
        } else if (result.modifiedCount === 0) {
            console.log('⚠️  Account found but not modified (may already be system account)');
        } else {
            console.log('✅ Account updated to system account!');
        }

        // Verify
        const account = await mongoose.connection.collection('accounts').findOne(
            { _id: new mongoose.Types.ObjectId('69e418ce28356c16bf089161') },
            { projection: { systemUser: 1, user: 1, currency: 1 } }
        );
        console.log('\nCurrent account:', account);

        await mongoose.disconnect();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

updateSystemAccount();
