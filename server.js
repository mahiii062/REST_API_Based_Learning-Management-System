// express application setup
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/courses");
const instructorRoutes = require("./routes/instructors");
const learnerRoutes = require("./routes/learners");
const bankRoutes = require("./routes/bank");
const { state } = require("./data");

// initialize express app
const app = express();
app.use(bodyParser.json());

// to check server is working properly or not
app.get("/", (req, res) => {
  res.json({
    message: "LMS API",
    coursesCount: state.courses.length,
  });
});


// necessary middleware
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/learners", learnerRoutes);
app.use("/api/bank", bankRoutes);
app.use('/certificates', express.static('certificates'));


// simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// app listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
