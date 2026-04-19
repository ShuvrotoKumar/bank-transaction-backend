const express = require("express");
const router = express.Router();
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware");
const createTransactionController = require("../controllers/transaction.controller").createTransaction;

router.post("/transaction", authMiddleware, createTransactionController);

router.get("/system/initial-transaction", authSystemUserMiddleware, createTransactionController);

module.exports = router;