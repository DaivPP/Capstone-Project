const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  createReminder,
  getReminders,
  deleteReminder
} = require('../controllers/reminderController');

const router = express.Router();

// Protect all routes
router.use(authMiddleware);

// Create a reminder
router.post('/', createReminder);

// Get all reminders for logged-in user
router.get('/', getReminders);

// Delete a reminder by ID
router.delete('/:id', deleteReminder);

module.exports = router;  // ✅ Export router directly
