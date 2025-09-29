const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createReport, getReports } = require('../controllers/reportController');

const router = express.Router();
router.use(authMiddleware);

router.post('/', createReport);
router.get('/', getReports);

module.exports = router;