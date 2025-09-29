const Medication = require('../models/Medication');

// Create new medication
exports.createMedication = async (req, res) => {
  try {
    const medication = new Medication({ ...req.body, userId: req.user._id });
    const saved = await medication.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all medications for logged-in user
exports.getMedications = async (req, res) => {
  try {
    const meds = await Medication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a medication
exports.deleteMedication = async (req, res) => {
  try {
    await Medication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medication deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
