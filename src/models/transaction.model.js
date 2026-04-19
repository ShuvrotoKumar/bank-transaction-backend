const mongoose = require("mongoose");



const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "From account is required"],
        index: true
    },
    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "To account is required"],
        index: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be positive"]
    },
    // currency: {
    //     type: String,
    //     required: [true, "Currency is required"] 
    // },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required"],
        index: true,
        unique: true
    }
}, {
    timestamps: true
});

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;