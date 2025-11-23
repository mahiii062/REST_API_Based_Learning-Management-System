// helpers/authMiddleware.js
const { verifyToken } = require("./utils");
const { state } = require("../data");

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing token" });
  const token = auth.replace("Bearer ", "");
  const decoded = verifyToken(token);
  if (!decoded) return res.status(401).json({ error: "Invalid token" });
  const user = state.users.find((u) => u.id === decoded.id);
  if (!user) return res.status(401).json({ error: "User not found" });
  req.user = user;
  next();
}

function roleCheck(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

module.exports = { authMiddleware, roleCheck };
