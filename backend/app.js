const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Mock data
let dashboardData = {
  activeMedications: 12,
  adherenceRate: 87,
  upcomingDoses: 5,
  healthcareProviders: 3,
};

let medications = [
  { id: 1, name: "Lisinopril", dose: "10mg", frequency: "Once daily", condition: "Blood pressure", time: "8:00 AM" },
  { id: 2, name: "Metformin", dose: "500mg", frequency: "Twice daily", condition: "Diabetes", time: "12:30 PM" }
];

// Routes
app.get("/api/dashboard", (req, res) => {
  res.json(dashboardData);
});

app.get("/api/medications", (req, res) => {
  res.json(medications);
});

app.post("/api/medications/:id/taken", (req, res) => {
  const { id } = req.params;
  console.log(`Medication ${id} marked as taken`);
  res.json({ message: `Medication ${id} marked as taken` });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
