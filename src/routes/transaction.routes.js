const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/transaction", authMiddleware, transactionController.createTransaction);

module.exports = router;