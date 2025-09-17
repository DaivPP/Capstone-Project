const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const auth = require('../Middleware/auth');

// Protect all routes
router.use(auth.protect);

router
  .route('/')
  .get(medicationController.getMedications)
  .post(medicationController.createMedication);

router
  .route('/:id')
  .get(medicationController.getMedication)
  .patch(medicationController.updateMedication)
  .delete(medicationController.deleteMedication);

router
  .route('/:id/mark-taken')
  .post(medicationController.markAsTaken);

router
  .route('/upcoming/medications')
  .get(medicationController.getUpcomingMedications);

module.exports = router;