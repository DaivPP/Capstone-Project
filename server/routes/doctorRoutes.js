const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { createDoctor, getDoctors, updateDoctor, deleteDoctor } = require('../controllers/doctorController');

const router = express.Router();
router.use(authMiddleware);

router.post('/', createDoctor);
router.get('/', getDoctors);
router.put('/:id', updateDoctor);
router.delete('/:id', deleteDoctor);

module.exports = router;