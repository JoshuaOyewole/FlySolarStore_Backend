const express = require('express');
const router = express.Router();
const { getAllServices } = require('../controllers/serviceController');

// GET /api/services
router.get('/', getAllServices);

module.exports = router;
