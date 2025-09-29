const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" })); // frontend origin
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reminders", require("./routes/reminderRoutes"));
app.use("/api/medications", require("./routes/medicationRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

// Test Route
app.get("/api", (req, res) => {
  res.json({ message: "✅ MedTracker API is working!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
