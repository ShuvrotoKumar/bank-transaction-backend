const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");
const AccountModel = require("../models/account.model");
const mongoose = require("mongoose");




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


async function createInitialTransaction(req, res) {
    const { amount, toAccount , idempotencyKey } = req.body;

    console.log('=== DEBUG createInitialTransaction ===');
    console.log('req.body:', req.body);
    console.log('amount:', amount, 'toAccount:', toAccount, 'idempotencyKey:', idempotencyKey);
    console.log('req.user._id:', req.user?._id);

    if(!amount || !toAccount || !idempotencyKey) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    
    const toUserAccount = await AccountModel.findById(toAccount);
    console.log('toUserAccount:', toUserAccount ? 'found' : 'not found');
    if(!toUserAccount) {
        return res.status(400).json({ message: "Destination account (toAccount) not found" });
    }


    const fromUserAccount = await AccountModel.findOne({
        systemUser: true,
        user: req.user._id
    });
    console.log('fromUserAccount:', fromUserAccount ? 'found' : 'not found');
    console.log('fromUserAccount._id:', fromUserAccount?._id);
    if(!fromUserAccount) {
        return res.status(400).json({ message: "System user account not found. Please create an account for the system user first." });
    }



    const session = await mongoose.startSession();
    session.startTransaction();

    const transactionData = {
        fromAccount: fromUserAccount._id,
        toAccount: toUserAccount._id,
        amount,
        idempotencyKey,
        status: "pending"
    };
    console.log('Creating transaction with data:', transactionData);

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