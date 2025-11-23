// routes/instructors.js
const express = require("express");
const router = express.Router();
const {
  listInstructors,
  getInstructor,
} = require("../controllers/instructorController");

router.get("/", listInstructors);
router.get("/:id", getInstructor);

module.exports = router;
