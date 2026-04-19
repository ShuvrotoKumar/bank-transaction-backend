require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('./src/models/user.model');

async function makeSystemUser() {
    try {
        // MongoDB connect
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');

        // আপনার email এখানে দিন
        const userEmail = process.argv[2] || 'your_email@example.com';
        
        console.log(`Finding user: ${userEmail}`);
        
        // Direct MongoDB update (bypasses mongoose immutable)
        const result = await mongoose.connection.collection('users').updateOne(
            { email: userEmail },
            { $set: { systemUser: true } }
        );

        if (result.matchedCount === 0) {
            console.log('❌ User not found');
            process.exit(1);
        }

        if (result.modifiedCount === 0) {
            console.log('⚠️ User found but not modified (maybe already system user)');
        } else {
            console.log('✅ User updated to system user successfully!');
        }

        // Verify
        const user = await mongoose.connection.collection('users').findOne(
            { email: userEmail },
            { projection: { email: 1, systemUser: 1 } }
        );
        console.log('Current user data:', user);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

makeSystemUser();
