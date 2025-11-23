// controllers/bankController.js
const { state, persistToFile } = require("../data");

function setupBank(req, res) {
  const uid = req.user.id;
  const { accountNumber, secret, initialBalance } = req.body;
  if (!accountNumber || !secret)
    return res.status(400).json({ error: "Missing fields" });
  state.bankAccounts[uid] = {
    accountNumber,
    secret,
    balance:
      typeof initialBalance === "number"
        ? initialBalance
        : state.bankAccounts[uid]?.balance || 0,
  };
  persistToFile();
  res.json({ message: "Bank info saved", bank: state.bankAccounts[uid] });
}

// check balance endpoint for any entity
function getBalance(req, res) {
  const { userId } = req.params;
  // allow instructors/learners to see their own balance, admin to see others
  if (!userId) return res.status(400).json({ error: "Missing userId" });
  const user = req.user;
  if (user.role !== "admin" && user.id !== userId)
    return res.status(403).json({ error: "Forbidden" });
  const b = state.bankAccounts[userId];
  if (!b) return res.status(404).json({ error: "No bank account" });
  res.json({ userId, balance: b.balance });
}

// instructor validates payout: transfer LMS -> instructor for pending payout records
function processPayouts(req, res) {
  const uid = req.user.id;
  // only instructor
  if (req.user.role !== "instructor")
    return res.status(403).json({ error: "Only instructor" });

  // find payouts due to this instructor
  const dues = state.transactions.filter(
    (t) =>
      t.type === "payout_due" &&
      t.instructorId === uid &&
      t.status === "pending"
  );

  if (!dues.length) return res.json({ message: "No payouts" });

  let paid = [];
  dues.forEach((d) => {
    const amount = d.amount;
    // check LMS balance
    if (
      !state.bankAccounts["LMS_ORG"] ||
      state.bankAccounts["LMS_ORG"].balance < amount
    ) {
      // cannot pay now
      d.status = "failed";
      d.failedAt = new Date().toISOString();
    } else {
      state.bankAccounts["LMS_ORG"].balance -= amount;
      state.bankAccounts[uid].balance += amount;
      d.status = "completed";
      d.paidAt = new Date().toISOString();
      paid.push({ payoutId: d.id, amount });
    }
  });

  persistToFile();
  res.json({
    message: "Payout processing done",
    paid,
    detailsCount: dues.length,
  });
}

module.exports = { setupBank, getBalance, processPayouts };
