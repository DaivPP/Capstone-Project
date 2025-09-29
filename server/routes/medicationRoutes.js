const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createMedication, getMedications } = require('../controllers/medicationController');

const router = express.Router();

router.use(authMiddleware);  // Protect all routes

router.post('/', createMedication);
router.get('/', getMedications);

module.exports = router;
