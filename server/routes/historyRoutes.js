const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createHistory, getHistory } = require('../controllers/historyController');

const router = express.Router();
router.use(authMiddleware);

router.post('/', createHistory);
router.get('/', getHistory);

module.exports = router;