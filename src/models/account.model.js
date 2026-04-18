const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "User is required"]
    },
   status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
        required: [true, "Status is required"]
    },
    currency: {
        type: String,
        default: 'USD',
        required: [true, "Currency is required"]
    },
    timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);