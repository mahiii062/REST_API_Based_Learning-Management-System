// controllers/learnerController.js
const { state, persistToFile } = require("../data");
const { generateCertificate } = require("../helpers/certificate");
const { makeId } = require("../helpers/utils");

function myCourses(req, res) {
  const uid = req.user.id;
  const my = state.courses
    .filter((c) => c.openTo.includes(uid))
    .map((c) => ({ id: c.id, title: c.title }));
  res.json(my);
}

function completeCourse(req, res) {
  const uid = req.user.id;
  const course = state.courses.find((c) => c.id === req.params.id);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  if (!course.openTo.includes(uid)) {
    return res.status(403).json({ error: "Not enrolled" });
  }

  const user = state.users.find((u) => u.id === uid);

  // create certificate ID
  const certId = makeId();

  // ✅ generate real PDF and get file path
  const certUrl = generateCertificate(user.name, course.title, certId);

  const cert = {
    id: certId,
    userId: uid,
    courseId: course.id,
    awardedAt: new Date().toISOString(),
    certificateUrl: certUrl, // ✅ now a real file link
  };

  state.transactions.push({
    id: makeId(),
    type: "certificate",
    payload: cert,
    createdAt: cert.awardedAt,
  });

  persistToFile();

  res.json({
    message: "Course completed. Certificate awarded.",
    certificate: cert,
  });
}

module.exports = { myCourses, completeCourse };
