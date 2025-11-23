// helpers/utils.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const SECRET = process.env.JWT_SECRET || 'supersecretkey';

function hashPassword(pwd) {
  return bcrypt.hashSync(pwd, 8);
}
function comparePassword(pwd, hash) {
  return bcrypt.compareSync(pwd, hash);
}
function createToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}
function makeId() {
  return uuidv4();
}

module.exports = { hashPassword, comparePassword, createToken, verifyToken, makeId };
