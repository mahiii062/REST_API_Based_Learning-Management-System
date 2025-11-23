// routes/learners.js
const express = require("express");
const router = express.Router();
const {
  myCourses,
  completeCourse,
} = require("../controllers/learnerController");
const { authMiddleware, roleCheck } = require("../helpers/authMiddleware");

router.get("/me/courses", authMiddleware, roleCheck(["learner"]), myCourses);
router.post(
  "/me/courses/:id/complete",
  authMiddleware,
  roleCheck(["learner"]),
  completeCourse
);

module.exports = router;
