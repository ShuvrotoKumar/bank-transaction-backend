const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/auth.middleware");
const createTransactionController = require("../controllers/transaction.controller").createTransaction;

router.post("/transaction", authMiddleware, createTransactionController);

module.exports = router;