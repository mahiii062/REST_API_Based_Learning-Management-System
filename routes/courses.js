// routes/courses.js
const express = require("express");
const router = express.Router();
const {
  listCourses,
  getCourse,
  buyCourse,
  getMaterials,
  createCourse,
} = require("../controllers/courseController");
const { authMiddleware, roleCheck } = require("../helpers/authMiddleware");

router.get("/", listCourses);
router.get("/:id", getCourse);
router.post("/:id/buy", authMiddleware, roleCheck(["learner"]), buyCourse);
router.get(
  "/:id/materials",
  authMiddleware,
  roleCheck(["learner"]),
  getMaterials
);
router.post("/", authMiddleware, roleCheck(["instructor"]), createCourse);

module.exports = router;
