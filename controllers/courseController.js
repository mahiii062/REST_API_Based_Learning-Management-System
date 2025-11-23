// controllers/courseController.js
const { state, persistToFile } = require("../data");
const { makeId } = require("../helpers/utils");

function listCourses(req, res) {
  const courses = state.courses.map((c) => ({
    id: c.id,
    title: c.title,
    price: c.price,
    instructorId: c.instructorId,
  }));
  res.json(courses);
}

function getCourse(req, res) {
  const c = state.courses.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: "Not found" });
  res.json(c);
}

// learner buys course -> creates transaction req to bank
function buyCourse(req, res) {
  const user = req.user;
  const course = state.courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });

  const { accountNumber, secret } = req.body;
  if (!accountNumber || !secret)
    return res.status(400).json({ error: "Missing bank info" });

  // check bank account of user
  const bank = state.bankAccounts[user.id];
  if (!bank || bank.accountNumber !== accountNumber || bank.secret !== secret)
    return res.status(400).json({ error: "Bank validation failed" });

  if (bank.balance < course.price)
    return res.status(400).json({ error: "Insufficient balance" });

  // create transaction request: LMS will take payment into its own account (simulate)
  const txn = {
    id: makeId(),
    type: "purchase",
    courseId: course.id,
    buyerId: user.id,
    sellerId: "LMS_ORG", // LMS main account
    amount: course.price,
    status: "completed", // immediate for simplicity
    createdAt: new Date().toISOString(),
  };
  // deduct from buyer
  bank.balance -= course.price;

  // LMS account store in bankAccounts under 'LMS_ORG'
  if (!state.bankAccounts["LMS_ORG"])
    state.bankAccounts["LMS_ORG"] = {
      accountNumber: "LMS-000",
      secret: "lms-secret",
      balance: 0,
    };
  state.bankAccounts["LMS_ORG"].balance += course.price;

  // record txn
  state.transactions.push(txn);

  // mark course as purchased for user (openTo)
  if (!course.openTo.includes(user.id)) course.openTo.push(user.id);

  // create a record that instructor should be paid later
  const instructorPayoutRecord = {
    id: makeId(),
    type: "payout_due",
    courseId: course.id,
    instructorId: course.instructorId,
    amount: Math.round(course.price * 0.6), // e.g. 60% goes to instructor; configurable
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  state.transactions.push(instructorPayoutRecord);

  persistToFile();
  res.json({
    message: "Purchase completed - course opened",
    transaction: txn,
    payoutDue: instructorPayoutRecord,
  });
}

// learner accesses materials
function getMaterials(req, res) {
  const user = req.user;
  const course = state.courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  if (!course.openTo.includes(user.id))
    return res
      .status(403)
      .json({ error: "You have not purchased this course" });
  res.json({ materials: course.materials });
}

// instructor creates a course
function createCourse(req, res) {
  const user = req.user;
  const { title, price, materials } = req.body;
  if (!title || typeof price !== "number")
    return res.status(400).json({ error: "Missing fields" });
  const course = {
    id: makeId(),
    title,
    price,
    instructorId: user.id,
    materials: materials || [],
    openTo: [],
    paidToInstructor: false,
  };
  state.courses.push(course);

  // LMS pays lump-sum to instructor for uploading (simulate)
  const instructor = state.instructors.find((i) => i.id === user.id);
  const payout =
    instructor && instructor.payoutRate ? instructor.payoutRate : 100;
  // add balance to instructor bank if they have account
  if (state.bankAccounts[user.id])
    state.bankAccounts[user.id].balance += payout;

  state.transactions.push({
    id: makeId(),
    type: "upload_payment",
    to: user.id,
    amount: payout,
    status: "completed",
    createdAt: new Date().toISOString(),
  });

  persistToFile();
  res
    .status(201)
    .json({ message: "Course created and instructor paid lump-sum", course });
}

module.exports = {
  listCourses,
  getCourse,
  buyCourse,
  getMaterials,
  createCourse,
};
