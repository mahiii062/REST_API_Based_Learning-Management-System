// controllers/authController.js
const { state, persistToFile } = require("../data");
const {
  hashPassword,
  comparePassword,
  createToken,
  makeId,
} = require("../helpers/utils");

// register a new user
async function register(req, res) {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "Missing fields" });
  if (state.users.find((u) => u.email === email))
    return res.status(400).json({ error: "Email exists" });
  const user = {
    id: makeId(),
    name,
    email,
    role,
    passwordHash: hashPassword(password),
  };
  state.users.push(user);
  // create bank account placeholder
  state.bankAccounts[user.id] = {
    accountNumber: null,
    secret: null,
    balance: 0,
  };
  persistToFile();
  const token = createToken({ id: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
// login an existing user
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });
  const user = state.users.find((u) => u.email === email);
  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  if (!comparePassword(password, user.passwordHash || ""))
    return res.status(400).json({ error: "Invalid credentials" });
  const token = createToken({ id: user.id, role: user.role });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

module.exports = { register, login };
