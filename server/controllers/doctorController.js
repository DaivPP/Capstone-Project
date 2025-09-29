const Doctor = require('../models/Doctor');

// Create
exports.createDoctor = async (req, res) => {
  const { name, specialty, contact, address, notes } = req.body;
  try {
    const doctor = new Doctor({ ...req.body, userId: req.user.userId });
    await doctor.save();
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read (get all for user)
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ userId: req.user.userId });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};