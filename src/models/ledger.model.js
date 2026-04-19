const mongoose = require("mongoose");


const ledgerSchema = new mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Account is required"],
        index: true,
        immutable: true
    },
    transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: [true, "Transaction is required"],
        index: true,
        immutable: true
    },
    amount: {
        type: Number,
        required: [true, "Amount is required"],
        min: [0, "Amount must be positive"],
        immutable: true
    },
    balance: {
        type: Number,
        required: [true, "Balance is required"],
        immutable: true
    },
    type: {
        type: String,
        enum: ["debit", "credit"],
        required: [true, "Type is required"],
        immutable: true
    }
});

function preventLedgerModification() {
    // TODO: Implement logic to prevent ledger modifications

    throw new Error("Ledger modification is not allowed");
}



ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);  

const ledgerModel = mongoose.model("Ledger", ledgerSchema);

module.exports = ledgerModel;