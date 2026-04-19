const express = require("express");
const router = express.Router();
const { authMiddleware, authSystemUserMiddleware } = require("../middleware/auth.middleware");
const { createTransaction, createInitialTransaction } = require("../controllers/transaction.controller");

router.post("/transaction", authMiddleware, createTransaction);

router.post("/system/initial-transaction", authSystemUserMiddleware, createInitialTransaction);

module.exports = router;