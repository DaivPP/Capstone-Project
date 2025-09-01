const Medication = require('../Models/Medication');
const User = require('../Models/user');

// Get all medications for a user
exports.getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id });
    res.status(200).json({
      status: 'success',
      results: medications.length,
      data: {
        medications
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get a specific medication
exports.getMedication = async (req, res) => {
  try {
    const medication = await Medication.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });
    
    if (!medication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Medication not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        medication
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Create a new medication
exports.createMedication = async (req, res) => {
  try {
    const newMedication = await Medication.create({
      ...req.body,
      userId: req.user.id
    });
    
    // Add medication to user's medications array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { medications: newMedication._id } }
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        medication: newMedication
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// Update a medication
exports.updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!medication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Medication not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        medication
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
};

// Delete a medication
exports.deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Medication not found'
      });
    }
    
    // Remove medication from user's medications array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { medications: req.params.id } }
    );
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Mark medication as taken
exports.markAsTaken = async (req, res) => {
  try {
    const medication = await Medication.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!medication) {
      return res.status(404).json({
        status: 'fail',
        message: 'Medication not found'
      });
    }
    
    // Add to adherence array
    medication.adherence.push({
      date: new Date(),
      taken: true,
      timeTaken: new Date()
    });
    
    await medication.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        medication
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// Get upcoming medications
exports.getUpcomingMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user.id });
    
    // Simple logic to get upcoming medications
    const now = new Date();
    const upcoming = medications.filter(med => {
      return med.reminders.some(reminder => {
        if (!reminder.enabled) return false;
        
        // Simple time comparison
        const reminderTime = reminder.time.split(':');
        const reminderDate = new Date();
        reminderDate.setHours(parseInt(reminderTime[0]), parseInt(reminderTime[1]), 0, 0);
        
        return reminderDate > now;
      });
    });
    
    res.status(200).json({
      status: 'success',
      results: upcoming.length,
      data: {
        medications: upcoming
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};