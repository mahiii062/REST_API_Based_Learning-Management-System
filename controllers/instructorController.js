// controllers/instructorController.js
const { state, persistToFile } = require("../data");

function listInstructors(req, res) {
  res.json(state.instructors);
}

function getInstructor(req, res) {
  const ins = state.instructors.find((i) => i.id === req.params.id);
  if (!ins) return res.status(404).json({ error: "Not found" });
  res.json(ins);
}

module.exports = { listInstructors, getInstructor };
