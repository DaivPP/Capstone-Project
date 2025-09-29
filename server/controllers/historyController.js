const History = require('../models/History');

// Create
exports.createHistory = async (req, res) => {
  const { medicationId, reminderId, action, notes } = req.body;
  try {
    const history = new History({ ...req.body, userId: req.user.userId });
    await history.save();
    res.status(201).json(history);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read (get all for user)
exports.getHistory = async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.userId })
      .populate('medicationId')
      .populate('reminderId');
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};