require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/courses", require("./routes/courses")); // <-- Added
app.use("/api/progress", require("./routes/progress")); // <-- Added
app.use("/api/mastery", require("./routes/mastery")); // <-- Added
app.use("/api/assignments", require("./routes/assignments"));

app.listen(5000, () =>
  console.log("Backend running on http://localhost:5000")
);