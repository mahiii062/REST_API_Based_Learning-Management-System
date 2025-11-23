// routes/bank.js
const express = require("express");
const router = express.Router();
const {
  setupBank,
  getBalance,
  processPayouts,
} = require("../controllers/bankController");
const { authMiddleware, roleCheck } = require("../helpers/authMiddleware");

router.post("/setup", authMiddleware, setupBank);
router.get("/balance/:userId", authMiddleware, getBalance);
router.post(
  "/payouts/process",
  authMiddleware,
  roleCheck(["instructor"]),
  processPayouts
);

module.exports = router;
