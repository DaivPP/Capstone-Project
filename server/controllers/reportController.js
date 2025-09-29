const Report = require('../models/Report');

// Create (e.g., generate a report)
exports.createReport = async (req, res) => {
  const { type, data } = req.body;
  try {
    const report = new Report({ type, data, userId: req.user.userId });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read (get all reports for user)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user.userId });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};