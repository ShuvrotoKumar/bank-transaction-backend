const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");
const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      required: [true, "Status is required"],
    },
    currency: {
      type: String,
      default: "USD",
      required: [true, "Currency is required"],
    },
  },
  { timestamps: true },
);
accountSchema.index({ user: 1, status: 1 }, { unique: true });

accountSchema.methods.getBalance = async function() {
    const balanceData=await ledgerModel.aggregate([
        {
            $match: {
                account: this._id
            }
        },
        {
            $group: {
                _id: null,
               totalDebit: { $sum: { $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0] } },
               totalCredit: { $sum: { $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0] } }
            }
        },
        {
          $project: {
            _id: 0,
            balance: { $subtract: ["$totalDebit", "$totalCredit"] }
          }
        }
    ]);
    if (!balanceData || balanceData.length === 0) {
        return 0;
    }
    return balanceData[0].balance;
}
const AccountModel = mongoose.model("Account", accountSchema);
module.exports = AccountModel;
