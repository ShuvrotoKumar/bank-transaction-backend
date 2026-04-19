const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const AccountModel = require("../models/account.model");
const mongoose = require("mongoose");

/**
 * Creates a transaction between two user accounts
 * Validates sufficient balance and account status before processing
 */
async function createTransaction(req, res) {
   const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

   if(!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "Missing required fields" });
   }

   const fromAccountDoc = await AccountModel.findById(fromAccount);
   const toAccountDoc = await AccountModel.findById(toAccount);

   if(!fromAccountDoc || !toAccountDoc) {
    return res.status(400).json({ message: "Invalid account" });
   }


   const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey });
   if(isTransactionAlreadyExists){

        if(isTransactionAlreadyExists.status === "completed") {
            return res.status(400).json({ message: "Transaction already completed" });
        }
        if(isTransactionAlreadyExists.status === "pending") {
            return res.status(400).json({ message: "Transaction is pending" });
        }
        if(isTransactionAlreadyExists.status === "failed") {
            return res.status(500).json({ message: "Transaction failed" });
        }
        
   }

   
   if(fromAccountDoc.status !== "active") {
    return res.status(400).json({ message: "Invalid account" });
   }
   if(toAccountDoc.status !== "active") {
    return res.status(400).json({ message: "Invalid account" });
   }

   const fromAccountBalance = await fromAccountDoc.getBalance();
   if(fromAccountBalance < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
   }
   


   const session = await mongoose.startSession();
   session.startTransaction();

   const transaction = await transactionModel.create({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status: "pending"
   }, { session });
    const debitLedger = await ledgerModel.create({
    account: fromAccount,
    amount: -amount,
    transaction: transaction._id
   }, { session });

   const creditLedger = await ledgerModel.create({
    account: toAccount,
    amount,
    transaction: transaction._id
   }, { session });

   transaction.status = "completed";
   await transaction.save({ session });

   await session.commitTransaction();
   await session.endSession();

   await emailService.transactionCreatedEmail(req.user.email, req.user.name, toAccount, amount);

   return res.status(201).json({ message: "Transaction created and email sent" });
}


/**
 * Creates an initial transaction from system user account to a user account
 * Only accessible by authenticated system users
 */
async function createInitialTransaction(req, res) {
    const { amount, toAccount , idempotencyKey } = req.body;

    // Validate required fields
    if(!amount || !toAccount || !idempotencyKey) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Verify destination account exists
    const toUserAccount = await AccountModel.findById(toAccount);
    if(!toUserAccount) {
        return res.status(400).json({ message: "Destination account (toAccount) not found" });
    }

    // Find system user's account for the transaction source
    const fromUserAccount = await AccountModel.findOne({
        systemUser: true,
        user: req.user._id
    });
    if(!fromUserAccount) {
        return res.status(400).json({ message: "System user account not found. Please create an account for the system user first." });
    }



    const session = await mongoose.startSession();
    session.startTransaction();

    // Prepare transaction data with system account as source
    const transactionData = {
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "pending"
    };

    // Create transaction within database session
    const [transaction] = await transactionModel.create([transactionData], { session });

    // Calculate balances
    const fromBalance = await fromUserAccount.getBalance();
    const toBalance = await toUserAccount.getBalance();

    const [debitLedger] = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        balance: fromBalance - amount,
        transaction: transaction._id,
        type: "debit"
    }], { session });

    const [creditLedger] = await ledgerModel.create([{
        account: toUserAccount._id,
        amount: amount,
        balance: toBalance + amount,
        transaction: transaction._id,
        type: "credit"
    }], { session });

    transaction.status = "completed";
    await transaction.save({ session });

    await session.commitTransaction();
    await session.endSession();

    await emailService.transactionCreatedEmail(req.user.email, req.user.name, toUserAccount._id, amount);

    return res.status(201).json({ message: "Initial transaction created and email sent" });

    
}
module.exports = {
    createTransaction,
    createInitialTransaction
}